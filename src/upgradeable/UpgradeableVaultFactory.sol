// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import "./UpgradeableVault.sol";
import "./UpgradeableVSToken.sol";

/**
 * @title UpgradeableVaultFactory - Factory for Deploying Upgradeable Vault Instances
 * @author vS Vault Team
 * @notice Factory contract for deploying upgradeable vault and token pairs with proper governance setup
 * 
 * @dev DESIGN PRINCIPLES:
 * 1. CONTROLLED DEPLOYMENT: Only authorized deployers can create new vaults
 * 2. STANDARDIZED SETUP: All vaults deployed with consistent governance structure
 * 3. TEMPLATE MANAGEMENT: Upgradeable implementation templates
 * 4. GOVERNANCE INTEGRATION: Automatic setup of roles and permissions
 * 
 * @dev SECURITY FEATURES:
 * - Role-based access control for deployments
 * - Template verification for implementation contracts
 * - Automatic governance setup with proper role distribution
 * - Emergency pause functionality
 * - Deployment tracking and registry
 */
contract UpgradeableVaultFactory is AccessControl, Pausable {
    // ============ ACCESS CONTROL ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant TEMPLATE_MANAGER_ROLE = keccak256("TEMPLATE_MANAGER_ROLE");

    // ============ STORAGE ============
    struct VaultDeployment {
        address vault;
        address token;
        address admin;
        uint256 deployedAt;
        uint256 maturityTimestamp;
        uint256 freezeTimestamp;
        string season;
        bool active;
    }

    // Implementation templates
    address public vaultImplementation;
    address public tokenImplementation;
    
    // Deployment registry
    VaultDeployment[] public deployments;
    mapping(address => uint256) public vaultToDeploymentIndex;
    mapping(string => address) public seasonToVault;
    
    // Governance configuration
    address public defaultAdmin;
    address public governanceTimelock;
    uint256 public deploymentCount;

    // ============ EVENTS ============
    event VaultDeployed(
        address indexed vault,
        address indexed token,
        address indexed admin,
        string season,
        uint256 maturityTimestamp,
        uint256 freezeTimestamp
    );
    
    event TemplateUpdated(
        address indexed oldImplementation,
        address indexed newImplementation,
        string templateType
    );
    
    event DeploymentDeactivated(address indexed vault, address indexed admin);
    event GovernanceConfigUpdated(address indexed newAdmin, address indexed newTimelock);

    // ============ MODIFIERS ============
    modifier validImplementation(address implementation) {
        require(implementation != address(0), "Invalid implementation");
        require(implementation.code.length > 0, "Implementation not a contract");
        _;
    }

    /**
     * @notice Initialize the factory with implementation templates
     * @param _vaultImplementation Address of the vault implementation contract
     * @param _tokenImplementation Address of the token implementation contract
     * @param _defaultAdmin Default admin for new deployments
     * @param _governanceTimelock Timelock contract for governance
     */
    constructor(
        address _vaultImplementation,
        address _tokenImplementation,
        address _defaultAdmin,
        address _governanceTimelock
    ) 
        validImplementation(_vaultImplementation)
        validImplementation(_tokenImplementation)
    {
        require(_defaultAdmin != address(0), "Invalid admin");
        require(_governanceTimelock != address(0), "Invalid timelock");

        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(DEPLOYER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(TEMPLATE_MANAGER_ROLE, msg.sender);

        // Initialize storage
        vaultImplementation = _vaultImplementation;
        tokenImplementation = _tokenImplementation;
        defaultAdmin = _defaultAdmin;
        governanceTimelock = _governanceTimelock;
        deploymentCount = 0;
    }

    /**
     * @notice Deploy a new upgradeable vault and token pair
     * @param season Season identifier (e.g., "Season1", "Q1-2025")
     * @param sonicNFT Address of the Sonic fNFT contract
     * @param underlyingToken Address of the underlying S token
     * @param protocolTreasury Address to receive protocol fees
     * @param maturityTimestamp When fNFTs can be claimed at 0% penalty
     * @param vaultFreezeTimestamp No deposits accepted after this
     * @param customAdmin Custom admin address (use address(0) for default)
     * @return vault Address of the deployed vault
     * @return token Address of the deployed token
     */
    function deployVault(
        string calldata season,
        address sonicNFT,
        address underlyingToken,
        address protocolTreasury,
        uint256 maturityTimestamp,
        uint256 vaultFreezeTimestamp,
        address customAdmin
    ) external onlyRole(DEPLOYER_ROLE) whenNotPaused returns (address vault, address token) {
        require(bytes(season).length > 0, "Season cannot be empty");
        require(seasonToVault[season] == address(0), "Season already exists");
        require(sonicNFT != address(0), "Invalid NFT contract");
        require(underlyingToken != address(0), "Invalid underlying token");
        require(protocolTreasury != address(0), "Invalid treasury");
        require(maturityTimestamp > block.timestamp, "Maturity must be future");
        require(vaultFreezeTimestamp > block.timestamp, "Freeze must be future");
        require(vaultFreezeTimestamp < maturityTimestamp, "Freeze before maturity");

        // Use custom admin or default
        address admin = customAdmin != address(0) ? customAdmin : defaultAdmin;

        // Deploy token first
        token = _deployToken(season, admin);
        
        // Deploy vault
        vault = _deployVault(
            token,
            sonicNFT,
            underlyingToken,
            protocolTreasury,
            maturityTimestamp,
            vaultFreezeTimestamp,
            admin
        );

        // Setup token minter role for vault
        UpgradeableVSToken(token).addMinter(vault);

        // Store deployment info
        VaultDeployment memory deployment = VaultDeployment({
            vault: vault,
            token: token,
            admin: admin,
            deployedAt: block.timestamp,
            maturityTimestamp: maturityTimestamp,
            freezeTimestamp: vaultFreezeTimestamp,
            season: season,
            active: true
        });

        deployments.push(deployment);
        vaultToDeploymentIndex[vault] = deployments.length - 1;
        seasonToVault[season] = vault;
        deploymentCount++;

        emit VaultDeployed(vault, token, admin, season, maturityTimestamp, vaultFreezeTimestamp);
    }

    /**
     * @notice Deploy token contract with proxy
     * @param season Season identifier for token naming
     * @param admin Admin address for the token
     * @return token Address of the deployed token proxy
     */
    function _deployToken(string calldata season, address admin) internal returns (address token) {
        // Create token name and symbol
        string memory tokenName = string(abi.encodePacked("vS Token ", season));
        string memory tokenSymbol = string(abi.encodePacked("vS", _seasonToSymbol(season)));

        // Encode initialization data
        bytes memory initData = abi.encodeWithSelector(
            UpgradeableVSToken.initialize.selector,
            tokenName,
            tokenSymbol,
            admin,
            address(this) // Temporary minter, will be changed to vault
        );

        // Deploy proxy
        token = address(new ERC1967Proxy(tokenImplementation, initData));
    }

    /**
     * @notice Deploy vault contract with proxy
     * @param tokenAddress Address of the associated token
     * @param sonicNFT Address of the Sonic fNFT contract
     * @param underlyingToken Address of the underlying S token
     * @param protocolTreasury Address to receive protocol fees
     * @param maturityTimestamp When fNFTs can be claimed at 0% penalty
     * @param vaultFreezeTimestamp No deposits accepted after this
     * @param admin Admin address for the vault
     * @return vault Address of the deployed vault proxy
     */
    function _deployVault(
        address tokenAddress,
        address sonicNFT,
        address underlyingToken,
        address protocolTreasury,
        uint256 maturityTimestamp,
        uint256 vaultFreezeTimestamp,
        address admin
    ) internal returns (address vault) {
        // Encode initialization data
        bytes memory initData = abi.encodeWithSelector(
            UpgradeableVault.initialize.selector,
            tokenAddress,
            sonicNFT,
            underlyingToken,
            protocolTreasury,
            maturityTimestamp,
            vaultFreezeTimestamp,
            admin
        );

        // Deploy proxy
        vault = address(new ERC1967Proxy(vaultImplementation, initData));
    }

    /**
     * @notice Convert season string to symbol suffix
     * @param season Season string
     * @return Symbol suffix for the season
     */
    function _seasonToSymbol(string calldata season) internal pure returns (string memory) {
        // Simple implementation - in production, you might want more sophisticated logic
        bytes memory seasonBytes = bytes(season);
        if (seasonBytes.length <= 3) {
            return season;
        }
        
        // Take first 3 characters
        bytes memory symbolBytes = new bytes(3);
        for (uint i = 0; i < 3; i++) {
            symbolBytes[i] = seasonBytes[i];
        }
        return string(symbolBytes);
    }

    /**
     * @notice Update vault implementation template
     * @param newImplementation Address of the new vault implementation
     */
    function updateVaultImplementation(address newImplementation) 
        external 
        onlyRole(TEMPLATE_MANAGER_ROLE) 
        validImplementation(newImplementation) 
    {
        address oldImplementation = vaultImplementation;
        vaultImplementation = newImplementation;
        
        emit TemplateUpdated(oldImplementation, newImplementation, "vault");
    }

    /**
     * @notice Update token implementation template
     * @param newImplementation Address of the new token implementation
     */
    function updateTokenImplementation(address newImplementation) 
        external 
        onlyRole(TEMPLATE_MANAGER_ROLE) 
        validImplementation(newImplementation) 
    {
        address oldImplementation = tokenImplementation;
        tokenImplementation = newImplementation;
        
        emit TemplateUpdated(oldImplementation, newImplementation, "token");
    }

    /**
     * @notice Deactivate a deployment (mark as inactive)
     * @param vaultAddress Address of the vault to deactivate
     */
    function deactivateDeployment(address vaultAddress) external onlyRole(ADMIN_ROLE) {
        uint256 index = vaultToDeploymentIndex[vaultAddress];
        require(deployments[index].vault == vaultAddress, "Vault not found");
        require(deployments[index].active, "Already inactive");
        
        deployments[index].active = false;
        
        emit DeploymentDeactivated(vaultAddress, msg.sender);
    }

    /**
     * @notice Update governance configuration
     * @param newDefaultAdmin New default admin address
     * @param newTimelock New timelock address
     */
    function updateGovernanceConfig(address newDefaultAdmin, address newTimelock) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(newDefaultAdmin != address(0), "Invalid admin");
        require(newTimelock != address(0), "Invalid timelock");
        
        defaultAdmin = newDefaultAdmin;
        governanceTimelock = newTimelock;
        
        emit GovernanceConfigUpdated(newDefaultAdmin, newTimelock);
    }

    /**
     * @notice Emergency pause the factory
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause the factory
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get deployment info by index
     * @param index Deployment index
     * @return Deployment struct
     */
    function getDeployment(uint256 index) external view returns (VaultDeployment memory) {
        require(index < deployments.length, "Index out of bounds");
        return deployments[index];
    }

    /**
     * @notice Get deployment info by vault address
     * @param vaultAddress Address of the vault
     * @return Deployment struct
     */
    function getDeploymentByVault(address vaultAddress) external view returns (VaultDeployment memory) {
        uint256 index = vaultToDeploymentIndex[vaultAddress];
        require(deployments[index].vault == vaultAddress, "Vault not found");
        return deployments[index];
    }

    /**
     * @notice Get all deployments
     * @return Array of all deployments
     */
    function getAllDeployments() external view returns (VaultDeployment[] memory) {
        return deployments;
    }

    /**
     * @notice Get active deployments only
     * @return Array of active deployments
     */
    function getActiveDeployments() external view returns (VaultDeployment[] memory) {
        uint256 activeCount = 0;
        
        // Count active deployments
        for (uint256 i = 0; i < deployments.length; i++) {
            if (deployments[i].active) {
                activeCount++;
            }
        }
        
        // Create array of active deployments
        VaultDeployment[] memory activeDeployments = new VaultDeployment[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < deployments.length; i++) {
            if (deployments[i].active) {
                activeDeployments[currentIndex] = deployments[i];
                currentIndex++;
            }
        }
        
        return activeDeployments;
    }

    /**
     * @notice Get vault address by season
     * @param season Season identifier
     * @return Vault address for the season
     */
    function getVaultBySeason(string calldata season) external view returns (address) {
        return seasonToVault[season];
    }

    /**
     * @notice Get total number of deployments
     * @return Total deployment count
     */
    function getTotalDeployments() external view returns (uint256) {
        return deployments.length;
    }

    /**
     * @notice Check if a season exists
     * @param season Season identifier
     * @return True if season exists
     */
    function seasonExists(string calldata season) external view returns (bool) {
        return seasonToVault[season] != address(0);
    }
} 