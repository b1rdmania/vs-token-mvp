// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

/**
 * @title UpgradeableVSToken - Upgradeable Vault-Minted Liquidity Token
 * @author vS Vault Team
 * @notice ERC-20 token representing claims on vesting NFT value, tradeable before maturity
 * 
 * @dev DESIGN PRINCIPLES:
 * 1. UPGRADEABLE: Admin-controlled upgrades with role-based access control
 * 2. ROLE-BASED MINTING: Only authorized vault contracts can mint/burn tokens
 * 3. PAUSABLE: Emergency pause functionality for security incidents
 * 4. STANDARD ERC-20: Full compatibility with DEXs, lending protocols, and DeFi infrastructure
 * 5. CONTROLLED ADMIN: Multi-signature and governance-controlled operations
 * 
 * @dev ECONOMIC FUNCTION:
 * - Represents proportional claims on vault's underlying token balance
 * - Minted when users deposit vesting NFTs into vault (99% of face value)
 * - Burned when users redeem for underlying tokens (proportional to vault balance)
 * - Trades freely on secondary markets at market-determined prices
 * 
 * @dev SECURITY FEATURES:
 * - Role-based access control prevents unauthorized token creation
 * - Emergency pause mechanism for security incidents
 * - Upgrade controls with timelock protection
 * - Storage layout versioning to prevent collisions
 * 
 * @dev USAGE:
 * - Users receive vS tokens when depositing fNFTs to vault
 * - vS tokens can be traded, used as collateral, or provided as liquidity
 * - At maturity, vS tokens can be redeemed 1:1 for underlying S tokens
 * - Market pricing reflects time value and liquidity premium
 */
contract UpgradeableVSToken is 
    UUPSUpgradeable, 
    AccessControlUpgradeable, 
    ERC20Upgradeable,
    PausableUpgradeable
{
    // ============ ACCESS CONTROL ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // ============ STORAGE LAYOUT V1 ============
    struct TokenStorageV1 {
        // Authorized minters (vault contracts)
        mapping(address => bool) authorizedMinters;
        
        // Upgrade management
        mapping(address => uint256) upgradeProposals;
        uint256 lastUpgradeTime;
        
        // Emergency controls
        uint256 pausedAt;
        string pauseReason;
        
        // Token metadata
        string tokenName;
        string tokenSymbol;
        uint8 tokenDecimals;
    }

    TokenStorageV1 private _storage;

    // ============ CONSTANTS ============
    uint256 public constant UPGRADE_DELAY = 48 hours;  // Minimum delay for upgrades
    uint256 public constant MAX_PAUSE_DURATION = 7 days; // Maximum pause duration
    uint256 public constant MIN_UPGRADE_INTERVAL = 24 hours; // Minimum time between upgrades

    // ============ EVENTS ============
    event MinterAdded(address indexed minter, address indexed admin);
    event MinterRemoved(address indexed minter, address indexed admin);
    
    // Upgrade events
    event UpgradeProposed(address indexed newImplementation, uint256 executeAfter);
    event UpgradeExecuted(address indexed newImplementation, address indexed executor);
    event UpgradeCancelled(address indexed newImplementation);
    
    // Emergency events
    event EmergencyPaused(address indexed pauser, string reason);
    event EmergencyUnpaused(address indexed unpauser);

    // ============ STORAGE GAPS ============
    // Reserve 50 storage slots for future versions
    uint256[50] private __gap;

    /**
     * @notice Initialize the upgradeable vS token
     * @dev This replaces the constructor for upgradeable contracts
     * @param _name Token name (e.g., "vS Token")
     * @param _symbol Token symbol (e.g., "vS")
     * @param _admin Initial admin address (should be multisig)
     * @param _initialMinter Initial minter address (vault contract)
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        address _admin,
        address _initialMinter
    ) public initializer {
        require(_admin != address(0), "Invalid admin");
        require(_initialMinter != address(0), "Invalid minter");

        // Initialize OpenZeppelin upgradeable contracts
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ERC20_init(_name, _symbol);
        __Pausable_init();

        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(MINTER_ROLE, _initialMinter);
        _grantRole(BURNER_ROLE, _initialMinter);

        // Initialize storage
        _storage.authorizedMinters[_initialMinter] = true;
        _storage.lastUpgradeTime = block.timestamp;
        _storage.tokenName = _name;
        _storage.tokenSymbol = _symbol;
        _storage.tokenDecimals = 18;
    }

    /**
     * @notice Authorize contract upgrades
     * @dev Only UPGRADER_ROLE can authorize upgrades with timelock
     * @param newImplementation Address of the new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {
        require(
            _storage.upgradeProposals[newImplementation] != 0 &&
            block.timestamp >= _storage.upgradeProposals[newImplementation],
            "Upgrade not ready or not proposed"
        );
        require(
            block.timestamp >= _storage.lastUpgradeTime + MIN_UPGRADE_INTERVAL,
            "Too soon since last upgrade"
        );
        
        _storage.lastUpgradeTime = block.timestamp;
        delete _storage.upgradeProposals[newImplementation];
        
        emit UpgradeExecuted(newImplementation, msg.sender);
    }

    /**
     * @notice Propose a contract upgrade
     * @dev Upgrades must be proposed and wait for timelock period
     * @param newImplementation Address of the new implementation
     */
    function proposeUpgrade(address newImplementation) external onlyRole(UPGRADER_ROLE) {
        require(newImplementation != address(0), "Invalid implementation");
        require(_storage.upgradeProposals[newImplementation] == 0, "Already proposed");
        
        uint256 executeAfter = block.timestamp + UPGRADE_DELAY;
        _storage.upgradeProposals[newImplementation] = executeAfter;
        
        emit UpgradeProposed(newImplementation, executeAfter);
    }

    /**
     * @notice Cancel a proposed upgrade
     * @dev Only UPGRADER_ROLE can cancel proposed upgrades
     * @param newImplementation Address of the proposed implementation
     */
    function cancelUpgrade(address newImplementation) external onlyRole(UPGRADER_ROLE) {
        require(_storage.upgradeProposals[newImplementation] != 0, "No proposal found");
        
        delete _storage.upgradeProposals[newImplementation];
        emit UpgradeCancelled(newImplementation);
    }

    /**
     * @notice Emergency pause the contract
     * @dev Can be called by PAUSER_ROLE
     * @param reason Reason for the pause
     */
    function emergencyPause(string calldata reason) external onlyRole(PAUSER_ROLE) {
        _storage.pausedAt = block.timestamp;
        _storage.pauseReason = reason;
        _pause();
        
        emit EmergencyPaused(msg.sender, reason);
    }

    /**
     * @notice Unpause the contract
     * @dev Can be called by PAUSER_ROLE or automatically after MAX_PAUSE_DURATION
     */
    function unpause() external {
        require(
            hasRole(PAUSER_ROLE, msg.sender) || 
            block.timestamp >= _storage.pausedAt + MAX_PAUSE_DURATION,
            "Not authorized to unpause or too early"
        );
        
        _storage.pauseReason = "";
        _unpause();
        
        emit EmergencyUnpaused(msg.sender);
    }

    /**
     * @notice Add a new authorized minter
     * @dev Only ADMIN_ROLE can add minters
     * @param minter Address to authorize as minter
     */
    function addMinter(address minter) external onlyRole(ADMIN_ROLE) {
        require(minter != address(0), "Invalid minter");
        require(!_storage.authorizedMinters[minter], "Already authorized");
        
        _storage.authorizedMinters[minter] = true;
        _grantRole(MINTER_ROLE, minter);
        _grantRole(BURNER_ROLE, minter);
        
        emit MinterAdded(minter, msg.sender);
    }

    /**
     * @notice Remove an authorized minter
     * @dev Only ADMIN_ROLE can remove minters
     * @param minter Address to remove from minters
     */
    function removeMinter(address minter) external onlyRole(ADMIN_ROLE) {
        require(_storage.authorizedMinters[minter], "Not authorized");
        
        _storage.authorizedMinters[minter] = false;
        _revokeRole(MINTER_ROLE, minter);
        _revokeRole(BURNER_ROLE, minter);
        
        emit MinterRemoved(minter, msg.sender);
    }

    /**
     * @notice Mint tokens to an address
     * @dev Only callable by authorized minters (vault contracts)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (18 decimal precision)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Cannot mint zero amount");
        
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from an address
     * @dev Only callable by authorized burners (vault contracts)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn (18 decimal precision)
     */
    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) whenNotPaused {
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

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Check if an address is an authorized minter
     * @param minter Address to check
     * @return True if authorized, false otherwise
     */
    function isAuthorizedMinter(address minter) external view returns (bool) {
        return _storage.authorizedMinters[minter];
    }

    /**
     * @notice Get upgrade proposal timestamp
     * @param implementation Address of the proposed implementation
     * @return Timestamp when upgrade can be executed (0 if not proposed)
     */
    function getUpgradeProposal(address implementation) external view returns (uint256) {
        return _storage.upgradeProposals[implementation];
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
     * @return decimals Token decimals
     */
    function getTokenInfo() external view returns (string memory name, string memory symbol, uint8 decimals) {
        return (_storage.tokenName, _storage.tokenSymbol, _storage.tokenDecimals);
    }

    /**
     * @notice Override decimals to return stored value
     */
    function decimals() public view override returns (uint8) {
        return _storage.tokenDecimals;
    }
} 