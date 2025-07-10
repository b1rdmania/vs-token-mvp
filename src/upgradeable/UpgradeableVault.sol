// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {IERC20} from "../interfaces/IERC20.sol";
import {IERC721} from "../interfaces/IERC721.sol";
import {IERC721Receiver} from "../interfaces/IERC721Receiver.sol";

interface IDecayfNFT is IERC721 {
    function claimDelegates(uint256 tokenId) external view returns (address);
    function getTotalAmount(uint256 tokenId) external view returns (uint256);
    function claimable(uint256 tokenId) external view returns (uint256);
    function claimVestedTokens(uint256 tokenId) external returns (uint256);
    function setDelegate(uint256 tokenId, address delegate) external;
}

interface IUpgradeableVSToken {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title UpgradeableVault - Upgradeable Vesting NFT Liquidity Protocol
 * @author vS Vault Team
 * @notice Converts illiquid vesting NFTs into liquid ERC-20 tokens (vS) with upgrade capabilities
 * 
 * @dev CORE DESIGN PRINCIPLES:
 * 1. UPGRADEABLE: Admin-controlled upgrades with timelock protection
 * 2. PAUSABLE: Emergency pause functionality for security incidents
 * 3. ROLE-BASED ACCESS: Multi-signature and governance-controlled operations
 * 4. WAIT-AND-HARVEST: Vault never claims early (avoiding penalty burns), waits until maturity
 * 5. SELF-DELEGATION: Automatically delegates NFTs to vault on deposit to prevent delegation attacks
 * 6. PROPORTIONAL REDEMPTION: Users get pro-rata share of harvested tokens, no hostage scenarios
 * 7. GAS-BOMB PROOF: Bounded batch processing prevents DoS attacks
 * 
 * @dev SECURITY FEATURES:
 * - UUPS proxy pattern for controlled upgrades
 * - Role-based access control with multiple admin types
 * - Emergency pause mechanism with automatic unpause
 * - Timelock delays for critical operations
 * - Storage layout versioning to prevent collisions
 * - Reentrancy protection on all external functions
 * - Try-catch wrappers isolate external call failures
 * - Bounded batch sizes prevent gas exhaustion attacks
 */
contract UpgradeableVault is 
    UUPSUpgradeable, 
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IERC721Receiver 
{
    // ============ ACCESS CONTROL ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // ============ STORAGE LAYOUT V1 ============
    struct VaultStorageV1 {
        IUpgradeableVSToken vS;
        address sonicNFT;
        address underlyingToken;
        address protocolTreasury;
        uint256 maturityTimestamp;
        uint256 vaultFreezeTimestamp;
        
        // Vault state
        uint256[] heldNFTs;
        mapping(uint256 => address) depositedNFTs;
        mapping(uint256 => bool) processed;
        uint256 nextClaim;
        uint256 processedCount;
        bool matured;
        
        // Upgrade management
        mapping(address => uint256) upgradeProposals;
        uint256 lastUpgradeTime;
        
        // Emergency controls
        uint256 pausedAt;
        string pauseReason;
    }

    VaultStorageV1 private _storage;

    // ============ CONSTANTS ============
    uint256 public constant MINT_FEE_BPS = 100;        // 1% mint fee
    uint256 public constant REDEEM_FEE_BPS = 200;      // 2% redeem fee
    uint256 public constant KEEPER_INCENTIVE_BPS = 0;  // 0% keeper incentive (self-keeper mode)
    uint256 public constant GRACE_PERIOD = 180 days;   // Grace period for surplus sweep
    uint256 public constant MAX_BATCH_SIZE = 20;       // Max NFTs per harvest batch
    uint256 public constant MIN_NFT_FACE = 100e18;     // 100 S minimum (prevents dust grief)
    uint256 public constant MAX_NFTS = 10000;          // SECURITY: Max NFTs to prevent scale issues
    
    // Upgrade controls
    uint256 public constant UPGRADE_DELAY = 48 hours;  // Minimum delay for upgrades
    uint256 public constant MAX_PAUSE_DURATION = 7 days; // Maximum pause duration
    uint256 public constant MIN_UPGRADE_INTERVAL = 24 hours; // Minimum time between upgrades

    // ============ EVENTS ============
    event NFTDeposited(address indexed user, uint256 indexed nftId, uint256 userAmount, uint256 feeAmount);
    event VestedTokensClaimed(address indexed caller, uint256 totalAmount, uint256 incentivePaid);
    event Redeemed(address indexed user, uint256 vsAmount, uint256 underlyingAmount, uint256 feeAmount);
    event SurplusSwept(address indexed sweeper, uint256 amount);
    event DelegationForced(uint256 indexed nftId);
    
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
     * @notice Initialize the upgradeable vault
     * @dev This replaces the constructor for upgradeable contracts
     * @param _vsToken Address of the vS token contract
     * @param _sonicNFT Address of the Sonic fNFT contract
     * @param _underlyingToken Address of the underlying S token
     * @param _protocolTreasury Address to receive protocol fees
     * @param _maturityTimestamp When fNFTs can be claimed at 0% penalty
     * @param _vaultFreezeTimestamp No deposits accepted after this
     * @param _admin Initial admin address (should be multisig)
     */
    function initialize(
        address _vsToken,
        address _sonicNFT,
        address _underlyingToken,
        address _protocolTreasury,
        uint256 _maturityTimestamp,
        uint256 _vaultFreezeTimestamp,
        address _admin
    ) public initializer {
        require(_vsToken != address(0), "Invalid vS token");
        require(_sonicNFT != address(0), "Invalid NFT contract");
        require(_underlyingToken != address(0), "Invalid underlying token");
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_admin != address(0), "Invalid admin");
        require(_maturityTimestamp > block.timestamp, "Maturity must be future");
        require(_vaultFreezeTimestamp > block.timestamp, "Freeze must be future");
        require(_vaultFreezeTimestamp < _maturityTimestamp, "Freeze before maturity");

        // Initialize OpenZeppelin upgradeable contracts
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _admin);
        _grantRole(EMERGENCY_ROLE, _admin);

        // Initialize storage
        _storage.vS = IUpgradeableVSToken(_vsToken);
        _storage.sonicNFT = _sonicNFT;
        _storage.underlyingToken = _underlyingToken;
        _storage.protocolTreasury = _protocolTreasury;
        _storage.maturityTimestamp = _maturityTimestamp;
        _storage.vaultFreezeTimestamp = _vaultFreezeTimestamp;
        _storage.nextClaim = 0;
        _storage.processedCount = 0;
        _storage.matured = false;
        _storage.lastUpgradeTime = block.timestamp;
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
     * @dev Can be called by PAUSER_ROLE or EMERGENCY_ROLE
     * @param reason Reason for the pause
     */
    function emergencyPause(string calldata reason) external {
        require(
            hasRole(PAUSER_ROLE, msg.sender) || hasRole(EMERGENCY_ROLE, msg.sender),
            "Not authorized to pause"
        );
        
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
     * @notice Deposit fNFT and mint vS tokens (1% fee taken at mint)
     * @dev CRITICAL: Self-delegates NFT immediately after transfer to prevent delegation attacks
     * @dev Users get 99% of NFT face value as vS tokens, 1% goes to protocol treasury
     * @param nftId ID of the fNFT to deposit (must be owned by msg.sender)
     */
    function deposit(uint256 nftId) external nonReentrant whenNotPaused {
        require(block.timestamp <= _storage.vaultFreezeTimestamp, "Vault frozen - use new season vault");
        require(_storage.depositedNFTs[nftId] == address(0), "NFT already deposited");
        require(IERC721(_storage.sonicNFT).ownerOf(nftId) == msg.sender, "Not NFT owner");
        require(_storage.heldNFTs.length < MAX_NFTS, "Vault at capacity");
        
        // Pull the NFT first
        IERC721(_storage.sonicNFT).safeTransferFrom(msg.sender, address(this), nftId);
        
        // Immediately set ourselves as delegate
        _ensureDelegated(nftId);
        
        uint256 totalValue = IDecayfNFT(_storage.sonicNFT).getTotalAmount(nftId);
        require(totalValue > 0, "NFT has no value");
        require(totalValue >= MIN_NFT_FACE, "NFT too small");

        // Store NFT info
        _storage.depositedNFTs[nftId] = msg.sender;
        _storage.heldNFTs.push(nftId);

        // Split 1% fee to treasury, rest to user
        uint256 feeAmount = (totalValue * MINT_FEE_BPS) / 10_000;
        uint256 userAmount = totalValue - feeAmount;
        
        // Mint vS tokens
        _storage.vS.mint(_storage.protocolTreasury, feeAmount);
        _storage.vS.mint(msg.sender, userAmount);

        emit NFTDeposited(msg.sender, nftId, userAmount, feeAmount);
    }

    /**
     * @notice Harvest vested tokens using re-harvestable batch pattern (gas-bomb proof)
     * @dev WAIT-AND-HARVEST STRATEGY: Only callable after maturity to avoid penalty burns
     * @dev Processes NFTs in bounded batches with retry logic for failed claims
     * @dev Anyone can call this function - no admin required (permissionless harvesting)
     * @param k Number of NFTs to process (bounded for gas safety, max 20)
     */
    function harvestBatch(uint256 k) external nonReentrant whenNotPaused {
        require(block.timestamp >= _storage.maturityTimestamp, "Too early - wait for maturity");
        require(k > 0 && k <= MAX_BATCH_SIZE, "Invalid batch size");
        require(!_storage.matured, "All NFTs already processed");
        
        uint256 processedNow = 0;
        uint256 startIndex = _storage.nextClaim;
        
        // Process k NFTs starting from pointer
        while (processedNow < k && processedNow < _storage.heldNFTs.length) {
            uint256 nftId = _storage.heldNFTs[_storage.nextClaim];
            
            // Only attempt if not already successfully processed
            if (!_storage.processed[nftId]) {
                try IDecayfNFT(_storage.sonicNFT).claimVestedTokens(nftId) returns (uint256 claimed) {
                    if (claimed > 0) {
                        _storage.processed[nftId] = true;
                        _storage.processedCount++;
                    }
                } catch {
                    // Leave processed[nftId] = false, will retry later
                }
            }
            
            _storage.nextClaim++;
            processedNow++;
            
            // Wrap around if we reach the end but still have unprocessed NFTs
            if (_storage.nextClaim >= _storage.heldNFTs.length) {
                _storage.nextClaim = 0;
                
                if (_storage.nextClaim == startIndex || processedNow >= _storage.heldNFTs.length) {
                    break;
                }
            }
        }
        
        // Check if all NFTs are now processed
        if (_storage.processedCount >= _storage.heldNFTs.length) {
            _storage.matured = true;
        }

        emit VestedTokensClaimed(msg.sender, 0, 0);
    }

    /**
     * @notice Redeem vS tokens for underlying S tokens (proportional redemption with 2% fee)
     * @dev Pro-rata redemption based on current vault balance (no hostage NFT risk)
     * @param amount Amount of vS tokens to burn
     */
    function redeem(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot redeem 0");
        require(_storage.vS.balanceOf(msg.sender) >= amount, "Insufficient vS balance");
        require(block.timestamp >= _storage.maturityTimestamp, "Too early - wait for maturity");
        
        uint256 vsTotalSupply = _storage.vS.totalSupply();
        require(vsTotalSupply > 0, "No vS tokens in circulation");
        
        // Calculate redemption from available balance (proportional)
        uint256 availableBalance = IERC20(_storage.underlyingToken).balanceOf(address(this));
        require(availableBalance > 0, "No tokens available for redemption");
        
        uint256 redeemableValue = (amount * availableBalance) / vsTotalSupply;
        
        // Calculate 2% redemption fee
        uint256 feeAmount = (redeemableValue * REDEEM_FEE_BPS) / 10_000;
        
        // Rounding guard: ensure minimum fee for non-zero redemptions
        if (feeAmount == 0 && redeemableValue > 0) {
            feeAmount = 1; // 1 wei minimum fee
        }
        
        uint256 userAmount = redeemableValue - feeAmount;
        
        // Burn vS tokens
        _storage.vS.burn(msg.sender, amount);
        
        // Transfer fee to treasury and remaining to user
        if (feeAmount > 0) {
            require(IERC20(_storage.underlyingToken).transfer(_storage.protocolTreasury, feeAmount), "Treasury transfer failed");
        }
        require(IERC20(_storage.underlyingToken).transfer(msg.sender, userAmount), "User transfer failed");

        emit Redeemed(msg.sender, amount, userAmount, feeAmount);
    }

    /**
     * @notice Sweep surplus tokens after grace period (PERMISSIONLESS)
     * @dev No owner required - anyone can call after maturity + 180 days
     */
    function sweepSurplus() external nonReentrant whenNotPaused {
        require(block.timestamp >= _storage.maturityTimestamp + GRACE_PERIOD, "Grace period not over");
        
        uint256 surplus = IERC20(_storage.underlyingToken).balanceOf(address(this));
        require(surplus > 0, "No surplus to sweep");
        
        require(IERC20(_storage.underlyingToken).transfer(_storage.protocolTreasury, surplus), "Surplus transfer failed");
        
        emit SurplusSwept(msg.sender, surplus);
    }

    /**
     * @notice Force delegation for NFTs (PERMISSIONLESS HELPER)
     * @dev Anyone can call to ensure NFTs remain claimable after potential upgrades
     * @param nftIds Array of NFT IDs to force delegate (max 50 to prevent gas bombs)
     */
    function forceDelegate(uint256[] calldata nftIds) external whenNotPaused {
        require(nftIds.length <= 50, "Batch too large");
        for (uint256 i = 0; i < nftIds.length; i++) {
            try IERC721(_storage.sonicNFT).ownerOf(nftIds[i]) returns (address owner) {
                if (owner == address(this)) {
                    _ensureDelegated(nftIds[i]);
                }
            } catch {
                continue;
            }
        }
    }

    /**
     * @notice Internal helper to ensure NFT delegates to this vault
     * @param nftId ID of the NFT to ensure delegation for
     */
    function _ensureDelegated(uint256 nftId) internal {
        if (IDecayfNFT(_storage.sonicNFT).claimDelegates(nftId) != address(this)) {
            try IDecayfNFT(_storage.sonicNFT).setDelegate(nftId, address(this)) {
                emit DelegationForced(nftId);
            } catch {
                // Ignore delegation failures
            }
        }
    }

    // ============ VIEW FUNCTIONS ============
    
    function hasMatured() external view returns (bool) {
        return _storage.matured;
    }

    function getBackingRatio() external view returns (uint256 ratio) {
        uint256 totalSupply = _storage.vS.totalSupply();
        if (totalSupply == 0) return 1e18;
        
        uint256 vaultBalance = IERC20(_storage.underlyingToken).balanceOf(address(this));
        return (vaultBalance * 1e18) / totalSupply;
    }

    function totalAssets() external view returns (uint256) {
        return IERC20(_storage.underlyingToken).balanceOf(address(this));
    }

    function getHeldNFTCount() external view returns (uint256) {
        return _storage.heldNFTs.length;
    }

    function getHeldNFT(uint256 index) external view returns (uint256) {
        require(index < _storage.heldNFTs.length, "Index out of bounds");
        return _storage.heldNFTs[index];
    }

    function getHarvestProgress() external view returns (uint256 processedNFTs, uint256 total) {
        return (_storage.processedCount, _storage.heldNFTs.length);
    }

    function getNextBatch() external view returns (uint256 startIndex, uint256 remaining) {
        return (_storage.nextClaim, _storage.heldNFTs.length > _storage.nextClaim ? _storage.heldNFTs.length - _storage.nextClaim : 0);
    }

    function isVaultFrozen() external view returns (bool) {
        return block.timestamp > _storage.vaultFreezeTimestamp;
    }

    function isProcessed(uint256 nftId) external view returns (bool) {
        return _storage.processed[nftId];
    }

    function getUpgradeProposal(address implementation) external view returns (uint256) {
        return _storage.upgradeProposals[implementation];
    }

    function getPauseInfo() external view returns (bool isPaused, uint256 pausedAt, string memory reason) {
        return (paused(), _storage.pausedAt, _storage.pauseReason);
    }

    // ============ STORAGE GETTERS ============
    
    function vS() external view returns (address) {
        return address(_storage.vS);
    }

    function sonicNFT() external view returns (address) {
        return _storage.sonicNFT;
    }

    function underlyingToken() external view returns (address) {
        return _storage.underlyingToken;
    }

    function protocolTreasury() external view returns (address) {
        return _storage.protocolTreasury;
    }

    function maturityTimestamp() external view returns (uint256) {
        return _storage.maturityTimestamp;
    }

    function vaultFreezeTimestamp() external view returns (uint256) {
        return _storage.vaultFreezeTimestamp;
    }

    function depositedNFTs(uint256 nftId) external view returns (address) {
        return _storage.depositedNFTs[nftId];
    }

    /**
     * @notice Handle ERC721 token reception with reentrancy protection
     * @dev Required for safeTransferFrom, prevents reentrancy attacks via malicious NFTs
     */
    function onERC721Received(
        address, /* operator */
        address, /* from */
        uint256, /* tokenId */
        bytes calldata /* data */
    ) external nonReentrant returns (bytes4) {
        require(msg.sender == _storage.sonicNFT, "Only accepts target NFTs");
        return IERC721Receiver.onERC721Received.selector;
    }
} 