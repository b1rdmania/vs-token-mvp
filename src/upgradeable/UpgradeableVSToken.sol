// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

/**
 * @title VsToken
 * @notice Upgradeable ERC-20 token representing claims on vesting NFT value
 * @dev TRUST GUARANTEES (IMMUTABLE FOREVER):
 * - Only designated vault can mint/burn tokens (minter address immutable)
 * - Upgrade delays are fixed (12h normal, 2h emergency when paused)
 * - Maximum pause duration is capped (7 days automatic unpause)
 * - Core minting control cannot be transferred or modified
 * - Economic model protected by immutable vault parameters
 */
contract VsToken is UUPSUpgradeable, AccessControlUpgradeable, ERC20Upgradeable, PausableUpgradeable {
    // Access Control Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    address public immutable MINTER;

    // Storage Layout V1
    struct TokenStorageV1 {
        mapping(address => uint256) upgradeProposals;
        mapping(address => string) upgradeReasons;
        mapping(address => bool) isEmergencyUpgrade;
        uint256 lastUpgradeTime;
        uint256 pausedAt;
        string pauseReason;
        string tokenName;
        string tokenSymbol;
        uint8 tokenDecimals;
    }

    TokenStorageV1 private _storage;

    // Constants
    uint256 public constant UPGRADE_DELAY = 12 hours;
    uint256 public constant EMERGENCY_UPGRADE_DELAY = 2 hours;
    uint256 public constant MAX_PAUSE_DURATION = 7 days;
    uint256 public constant MIN_UPGRADE_INTERVAL = 6 hours;

    // Events
    event UpgradeProposed(address indexed newImplementation, uint256 executeAfter, string reason, bool isEmergency);
    event UpgradeExecuted(address indexed newImplementation, address indexed executor, string reason);
    event UpgradeCancelled(address indexed newImplementation);
    event EmergencyPaused(address indexed pauser, string reason);
    event EmergencyUnpaused(address indexed unpauser);

    /// @dev Storage gap for future upgrades (reserves 49 slots)
    uint256[49] private __gap;

    /**
     * @notice Constructor sets immutable minter address
     * @dev This constructor is called only once during proxy deployment
     * @param _minter The address that can mint/burn tokens (typically the vault contract)
     */
    constructor(address _minter) {
        require(_minter != address(0), "Minter cannot be zero address");
        MINTER = _minter;
    }

    /**
     * @notice Initialize the upgradeable token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _admin Initial admin address
     */
    function initialize(string memory _name, string memory _symbol, address _admin) public initializer {
        require(_admin != address(0), "Invalid admin");

        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ERC20_init(_name, _symbol);
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(EMERGENCY_ROLE, _admin);

        _storage.lastUpgradeTime = block.timestamp;
        _storage.tokenName = _name;
        _storage.tokenSymbol = _symbol;
        _storage.tokenDecimals = 18;
    }

    /**
     * @notice Authorize contract upgrades
     * @dev Validates proposal timing and authorization for normal/emergency upgrades
     * @param newImplementation Address of the new implementation
     */
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
     * @notice Propose a contract upgrade with 12-hour timelock
     * @param newImplementation Address of the new implementation
     * @param reason Description of the upgrade
     */
    function proposeUpgrade(address newImplementation, string calldata reason) external onlyRole(ADMIN_ROLE) {
        require(newImplementation != address(0), "Invalid implementation");
        require(_storage.upgradeProposals[newImplementation] == 0, "Already proposed");

        uint256 executeAfter = block.timestamp + UPGRADE_DELAY;
        _storage.upgradeProposals[newImplementation] = executeAfter;
        _storage.upgradeReasons[newImplementation] = reason;

        emit UpgradeProposed(newImplementation, executeAfter, reason, false);
    }

    /**
     * @notice Cancel a proposed upgrade
     * @param newImplementation Address of the proposed implementation
     */
    function cancelUpgrade(address newImplementation) external {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(EMERGENCY_ROLE, msg.sender), "Not authorized to cancel");
        require(_storage.upgradeProposals[newImplementation] != 0, "No proposal found");

        delete _storage.upgradeProposals[newImplementation];
        delete _storage.upgradeReasons[newImplementation];
        delete _storage.isEmergencyUpgrade[newImplementation];

        emit UpgradeCancelled(newImplementation);
    }

    /**
     * @notice Propose an emergency upgrade with 2-hour timelock
     * @param newImplementation Address of the new implementation
     * @param exploitDescription Description of the exploit being fixed
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
     * @param newImplementation Address of the proposed implementation
     */
    function cancelEmergencyUpgrade(address newImplementation) external onlyRole(EMERGENCY_ROLE) {
        require(_storage.upgradeProposals[newImplementation] != 0, "No emergency proposal found");
        require(_storage.isEmergencyUpgrade[newImplementation], "Not an emergency upgrade");

        delete _storage.upgradeProposals[newImplementation];
        delete _storage.upgradeReasons[newImplementation];
        delete _storage.isEmergencyUpgrade[newImplementation];

        emit UpgradeCancelled(newImplementation);
    }

    /**
     * @notice Get upgrade proposal details
     * @param implementation Address of the proposed implementation
     * @return executeAfter Timestamp when upgrade can be executed
     * @return reason Description of the upgrade
     * @return isEmergency True if it's an emergency upgrade, false otherwise
     */
    function getUpgradeDetails(address implementation)
        external
        view
        returns (uint256 executeAfter, string memory reason, bool isEmergency)
    {
        return (
            _storage.upgradeProposals[implementation],
            _storage.upgradeReasons[implementation],
            _storage.isEmergencyUpgrade[implementation]
        );
    }

    /**
     * @notice Emergency pause the contract
     * @param reason Reason for the pause
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

    /**
     * @notice Mint tokens to an address (minter only)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external whenNotPaused {
        require(msg.sender == MINTER, "Only minter can mint");
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Cannot mint zero amount");

        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from an address (minter only)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external whenNotPaused {
        require(msg.sender == MINTER, "Only minter can burn");
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Cannot burn zero amount");
        require(balanceOf(from) >= amount, "Insufficient balance to burn");

        _burn(from, amount);
    }

    /**
     * @notice Override transfer to add pause functionality
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }

    /**
     * @notice Override transferFrom to add pause functionality
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    /**
     * @notice Override approve to add pause functionality
     */
    function approve(address spender, uint256 amount) public override whenNotPaused returns (bool) {
        return super.approve(spender, amount);
    }

    /**
     * @notice Get minter address
     * @return Address of the minter contract
     */
    function getMinter() external view returns (address) {
        return MINTER;
    }

    /**
     * @notice Get upgrade proposal timestamp
     * @param implementation Address of the proposed implementation
     * @return Timestamp when upgrade can be executed
     */
    function getUpgradeProposal(address implementation) external view returns (uint256) {
        return _storage.upgradeProposals[implementation];
    }

    /**
     * @notice Get upgrade reason
     * @param implementation Address of the proposed implementation
     * @return Reason for the upgrade
     */
    function getUpgradeReason(address implementation) external view returns (string memory) {
        return _storage.upgradeReasons[implementation];
    }

    /**
     * @notice Get pause information
     * @return isPaused Whether contract is paused
     * @return pausedAt Timestamp when paused
     * @return reason Reason for pause
     */
    function getPauseInfo() external view returns (bool isPaused, uint256 pausedAt, string memory reason) {
        return (paused(), _storage.pausedAt, _storage.pauseReason);
    }

    /**
     * @notice Get token metadata
     * @return name Token name
     * @return symbol Token symbol
     * @return decimals_ Token decimals
     */
    function getTokenInfo() external view returns (string memory name, string memory symbol, uint8 decimals_) {
        return (_storage.tokenName, _storage.tokenSymbol, _storage.tokenDecimals);
    }

    /**
     * @notice Get token decimals
     */
    function decimals() public view override returns (uint8) {
        return _storage.tokenDecimals;
    }
}
