// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface ISonicAirdropNFT is IERC1155 {
    function unlockAndBurnAirdrop(uint8 season, uint128 amount) external;
}

interface IVSToken {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title Vault - Season 1 fNFT Liquidity Protocol
 * @notice Converts Season 1 fNFTs into liquid vS tokens, redeemable 1:1 at maturity
 * @dev Simplified vault for Season 1 only with multisig governance and upgrade controls with trusted multisig
 */
contract Vault is
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IERC1155Receiver
{
    // ============ ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // ============ IMMUTABLE PARAMETERS ============
    IVSToken public immutable VS_TOKEN;
    address public immutable SONIC_NFT;
    address public immutable PROTOCOL_TREASURY;
    uint256 public immutable MATURITY_TIMESTAMP;
    uint256 public immutable VAULT_FREEZE_TIMESTAMP;

    // ============ CONSTANTS ============
    uint256 public constant SEASON_1_ID = 1; // Season 1 token ID
    uint256 public constant MINT_FEE_BPS = 100; // 1% mint fee
    uint256 public constant REDEEM_FEE_BPS = 200; // 2% redeem fee
    uint256 public constant GRACE_PERIOD = 180 days;
    uint256 public constant MIN_NFT_FACE = 100e18;
    uint256 public constant UPGRADE_DELAY = 12 hours;
    uint256 public constant EMERGENCY_UPGRADE_DELAY = 2 hours;
    uint256 public constant MAX_PAUSE_DURATION = 7 days;
    uint256 public constant MIN_UPGRADE_INTERVAL = 6 hours;

    // ============ STORAGE ============
    struct VaultStorage {
        bool harvested; // Has Season 1 been harvested
        // Upgrade management
        mapping(address => uint256) upgradeProposals;
        mapping(address => string) upgradeReasons;
        mapping(address => bool) isEmergencyUpgrade;
        uint256 lastUpgradeTime;
        // Emergency controls
        uint256 pausedAt;
        string pauseReason;
    }

    VaultStorage private _storage;

    // ============ EVENTS ============
    event NFTDeposited(address indexed user, uint256 amount, uint256 userAmount, uint256 feeAmount);
    event Season1Harvested(uint256 amount);
    event Redeemed(address indexed user, uint256 vsAmount, uint256 nativeAmount, uint256 feeAmount);
    event SurplusSwept(address indexed sweeper, uint256 amount);
    event UpgradeProposed(address indexed newImplementation, uint256 executeAfter, string reason, bool isEmergency);
    event UpgradeExecuted(address indexed newImplementation, address indexed executor, string reason);
    event UpgradeCancelled(address indexed newImplementation);
    event EmergencyPaused(address indexed pauser, string reason);
    event EmergencyUnpaused(address indexed unpauser);

    // ============ STORAGE GAP ============
    uint256[50] private __gap;

    /**
     * @notice Constructor sets immutable addresses and timestamps
     * @param _vS The vS token contract address
     * @param _sonicNft Address of the Sonic fNFT contract
     * @param _protocolTreasury Address to receive protocol fees
     * @param _maturityTimestamp When fNFTs can be claimed at 0% penalty
     * @param _vaultFreezeTimestamp No deposits accepted after this
     */
    constructor(
        address _vS,
        address _sonicNft,
        address _protocolTreasury,
        uint256 _maturityTimestamp,
        uint256 _vaultFreezeTimestamp
    ) {
        require(_vS != address(0), "vS token cannot be zero address");
        require(_sonicNft != address(0), "Invalid NFT contract");
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_maturityTimestamp > 0, "Invalid maturity timestamp");
        require(_vaultFreezeTimestamp > 0, "Invalid freeze timestamp");
        require(_vaultFreezeTimestamp < _maturityTimestamp, "Freeze must be before maturity");

        VS_TOKEN = IVSToken(_vS);
        SONIC_NFT = _sonicNft;
        PROTOCOL_TREASURY = _protocolTreasury;
        MATURITY_TIMESTAMP = _maturityTimestamp;
        VAULT_FREEZE_TIMESTAMP = _vaultFreezeTimestamp;
    }

    /**
     * @notice Initialize the upgradeable vault
     * @dev This replaces the constructor for upgradeable contracts
     * @dev All addresses and timestamps are set in constructor as immutable
     * @param _admin Initial admin address (should be multisig)
     */
    function initialize(address _admin) public initializer {
        require(_admin != address(0), "Invalid admin");

        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(EMERGENCY_ROLE, _admin);

        _storage.lastUpgradeTime = block.timestamp;
    }

    // ============ UPGRADE FUNCTIONS ============

    function _authorizeUpgrade(address newImplementation) internal override {
        require(_storage.upgradeProposals[newImplementation] != 0, "No upgrade proposal found");
        require(block.timestamp >= _storage.upgradeProposals[newImplementation], "Upgrade delay not met");

        bool proposalIsEmergency = _storage.isEmergencyUpgrade[newImplementation];

        if (proposalIsEmergency) {
            require(paused(), "Emergency upgrades only when paused");
            require(hasRole(EMERGENCY_ROLE, msg.sender), "Not emergency authorized");
        } else {
            require(!paused(), "Normal upgrades only when not paused");
            require(hasRole(ADMIN_ROLE, msg.sender), "Not admin authorized");
        }

        require(block.timestamp >= _storage.lastUpgradeTime + MIN_UPGRADE_INTERVAL, "Too soon since last upgrade");

        _storage.lastUpgradeTime = block.timestamp;

        string memory reason = _storage.upgradeReasons[newImplementation];
        emit UpgradeExecuted(newImplementation, msg.sender, reason);

        delete _storage.upgradeProposals[newImplementation];
        delete _storage.upgradeReasons[newImplementation];
        delete _storage.isEmergencyUpgrade[newImplementation];
    }

    /**
     * @notice Propose a contract upgrade
     */
    function proposeUpgrade(address newImplementation, string calldata reason) external onlyRole(ADMIN_ROLE) {
        require(newImplementation != address(0), "Invalid implementation");
        require(_storage.upgradeProposals[newImplementation] == 0, "Already proposed");
        require(bytes(reason).length > 0, "Must provide reason");

        uint256 executeAfter = block.timestamp + UPGRADE_DELAY;
        _storage.upgradeProposals[newImplementation] = executeAfter;
        _storage.upgradeReasons[newImplementation] = reason;

        emit UpgradeProposed(newImplementation, executeAfter, reason, false);
    }

    /**
     * @notice Cancel a proposed upgrade
     */
    function cancelUpgrade(address newImplementation) external {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(EMERGENCY_ROLE, msg.sender), "Not authorized to cancel");
        require(_storage.upgradeProposals[newImplementation] != 0, "No proposal found");

        delete _storage.upgradeProposals[newImplementation];
        delete _storage.upgradeReasons[newImplementation];

        emit UpgradeCancelled(newImplementation);
    }

    /**
     * @notice Propose an emergency contract upgrade
     */
    function proposeEmergencyUpgrade(address newImplementation, string calldata exploitDescription)
        external
        onlyRole(EMERGENCY_ROLE)
        whenPaused
    {
        require(newImplementation != address(0), "Invalid implementation");
        require(bytes(exploitDescription).length > 0, "Must describe exploit");
        require(_storage.upgradeProposals[newImplementation] == 0, "Already proposed");

        uint256 executeAfter = block.timestamp + EMERGENCY_UPGRADE_DELAY;
        _storage.upgradeProposals[newImplementation] = executeAfter;
        _storage.upgradeReasons[newImplementation] = exploitDescription;
        _storage.isEmergencyUpgrade[newImplementation] = true;

        emit UpgradeProposed(newImplementation, executeAfter, exploitDescription, true);
    }

    /**
     * @notice Cancel a proposed emergency upgrade
     */
    function cancelEmergencyUpgrade(address newImplementation) external onlyRole(EMERGENCY_ROLE) {
        require(_storage.upgradeProposals[newImplementation] != 0, "No proposal found");

        delete _storage.upgradeProposals[newImplementation];
        delete _storage.upgradeReasons[newImplementation];
        delete _storage.isEmergencyUpgrade[newImplementation];

        emit UpgradeCancelled(newImplementation);
    }

    /**
     * @notice Emergency pause the contract
     */
    function emergencyPause(string calldata reason) external onlyRole(EMERGENCY_ROLE) {
        _storage.pausedAt = block.timestamp;
        _storage.pauseReason = reason;
        _pause();

        emit EmergencyPaused(msg.sender, reason);
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external {
        require(
            hasRole(EMERGENCY_ROLE, msg.sender) || block.timestamp >= _storage.pausedAt + MAX_PAUSE_DURATION,
            "Not authorized to unpause or too early"
        );

        _storage.pauseReason = "";
        _unpause();

        emit EmergencyUnpaused(msg.sender);
    }

    // ============ CORE FUNCTIONS ============

    /**
     * @notice Deposit Season 1 fNFTs and mint vS tokens
     * @dev Simple deposit function - only accepts Season 1 fNFTs (tokenId = 1)
     */
    function deposit() external nonReentrant whenNotPaused {
        require(block.timestamp <= VAULT_FREEZE_TIMESTAMP, "Vault frozen");

        uint256 userBalance = IERC1155(SONIC_NFT).balanceOf(msg.sender, SEASON_1_ID);
        require(userBalance > 0, "No Season 1 fNFTs");
        require(userBalance >= MIN_NFT_FACE, "Amount too small");

        // Transfer all user's Season 1 fNFTs to vault
        IERC1155(SONIC_NFT).safeTransferFrom(msg.sender, address(this), SEASON_1_ID, userBalance, "");

        // Calculate fees: 1% to treasury, 99% to user
        uint256 feeAmount = (userBalance * MINT_FEE_BPS) / 10_000;
        uint256 userAmount = userBalance - feeAmount;

        // Mint vS tokens
        VS_TOKEN.mint(PROTOCOL_TREASURY, feeAmount);
        VS_TOKEN.mint(msg.sender, userAmount);

        emit NFTDeposited(msg.sender, userBalance, userAmount, feeAmount);
    }

    /**
     * @notice Harvest Season 1 fNFTs after maturity
     */
    function harvest() external nonReentrant whenNotPaused {
        require(block.timestamp >= MATURITY_TIMESTAMP, "Too early - wait for maturity");
        require(!_storage.harvested, "Already harvested");

        uint256 balance = IERC1155(SONIC_NFT).balanceOf(address(this), SEASON_1_ID);
        if (balance > 0) {
            _storage.harvested = true;
            ISonicAirdropNFT(SONIC_NFT).unlockAndBurnAirdrop(1, uint128(balance));
            emit Season1Harvested(balance);
        }
    }

    /**
     * @notice Redeem vS tokens for S tokens (2% fee)
     */
    function redeem(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot redeem 0");
        require(VS_TOKEN.balanceOf(msg.sender) >= amount, "Insufficient vS balance");
        require(block.timestamp >= MATURITY_TIMESTAMP, "Too early - wait for maturity");

        uint256 vsTotalSupply = VS_TOKEN.totalSupply();
        require(vsTotalSupply > 0, "No vS tokens in circulation");

        uint256 availableBalance = address(this).balance; // Native S balance
        require(availableBalance > 0, "No tokens available for redemption");

        uint256 redeemableValue = (amount * availableBalance) / vsTotalSupply;
        uint256 feeAmount = (redeemableValue * REDEEM_FEE_BPS) / 10_000;

        if (feeAmount == 0 && redeemableValue > 0) {
            feeAmount = 1; // 1 wei minimum fee
        }

        uint256 userAmount = redeemableValue - feeAmount;

        require(redeemableValue >= 1000, "Redeem amount too small");

        VS_TOKEN.burn(msg.sender, amount);

        if (feeAmount > 0) {
            (bool treasurySuccess,) = payable(PROTOCOL_TREASURY).call{value: feeAmount}("");
            require(treasurySuccess, "Treasury transfer failed");
        }

        (bool userSuccess,) = payable(msg.sender).call{value: userAmount}("");
        require(userSuccess, "User transfer failed");

        emit Redeemed(msg.sender, amount, userAmount, feeAmount);
    }

    /**
     * @notice Sweep surplus native S tokens after grace period
     */
    function sweepSurplus() external nonReentrant whenNotPaused {
        require(block.timestamp >= MATURITY_TIMESTAMP + GRACE_PERIOD, "Grace period not over");

        uint256 surplus = address(this).balance; // Native S balance
        require(surplus > 0, "No surplus to sweep");

        (bool success,) = payable(PROTOCOL_TREASURY).call{value: surplus}("");
        require(success, "Surplus transfer failed");

        emit SurplusSwept(msg.sender, surplus);
    }

    // ============ VIEW FUNCTIONS ============

    function hasMatured() external view returns (bool) {
        return _storage.harvested;
    }

    function getBackingRatio() external view returns (uint256 ratio) {
        uint256 totalSupply = VS_TOKEN.totalSupply();
        if (totalSupply == 0) return 0;

        uint256 vaultBalance = address(this).balance; // Native S balance
        return (vaultBalance * 1e18) / totalSupply;
    }

    function totalAssets() external view returns (uint256) {
        return address(this).balance; // Native S balance
    }

    function isVaultFrozen() external view returns (bool) {
        return block.timestamp > VAULT_FREEZE_TIMESTAMP;
    }

    function getUpgradeProposal(address implementation) external view returns (uint256) {
        return _storage.upgradeProposals[implementation];
    }

    function getUpgradeReason(address implementation) external view returns (string memory) {
        return _storage.upgradeReasons[implementation];
    }

    function getPauseInfo() external view returns (bool isPaused, uint256 pausedAt, string memory reason) {
        return (paused(), _storage.pausedAt, _storage.pauseReason);
    }

    function getUpgradeDetails(address implementation)
        external
        view
        returns (uint256 executeAfter, string memory reason)
    {
        return (_storage.upgradeProposals[implementation], _storage.upgradeReasons[implementation]);
    }

    // ============ ERC1155 RECEIVER ============

    function onERC1155Received(
        address, /* operator */
        address, /* from */
        uint256 id,
        uint256, /* value */
        bytes calldata /* data */
    ) external view returns (bytes4) {
        require(msg.sender == SONIC_NFT, "Only accepts Sonic NFTs");
        require(id == SEASON_1_ID, "Only accepts Season 1 fNFTs");
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address, /* operator */
        address, /* from */
        uint256[] calldata ids,
        uint256[] calldata, /* values */
        bytes calldata /* data */
    ) external view returns (bytes4) {
        require(msg.sender == SONIC_NFT, "Only accepts Sonic NFTs");
        for (uint256 i = 0; i < ids.length; i++) {
            require(ids[i] == SEASON_1_ID, "Only accepts Season 1 fNFTs");
        }
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC1155Receiver).interfaceId || interfaceId == type(IERC165).interfaceId
            || super.supportsInterface(interfaceId);
    }

    // ============ RECEIVE FUNCTION ============

    /**
     * @notice Allow contract to receive native S tokens from unlockAndBurnAirdrop
     */
    receive() external payable {
        // Contract can receive native S tokens from harvest operations
    }
}
