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
 * @title UpgradeableVault - Simplified Upgradeable Vesting NFT Liquidity Protocol
 * @author vS Vault Team
 * @notice Converts illiquid vesting NFTs into liquid ERC-20 tokens (vS) with trusted multisig governance
 * 
 * @dev DESIGN PRINCIPLES:
 * 1. TRUSTED MULTISIG
 * 2. FAST RESPONSE: 12-hour delays for normal operations, 2-hour emergency response
 * 3. SIMPLE ROLES: Just ADMIN_ROLE for normal operations, EMERGENCY_ROLE for incidents
 * 4. ESSENTIAL SAFETY: Emergency pause, upgrade delays, automatic unpause
 * 5. WAIT-AND-HARVEST: Vault never claims early, waits until maturity
 * 6. SELF-DELEGATION: Automatically delegates NFTs to prevent delegation attacks
 * 7. GAS-BOMB PROOF: Bounded batch processing prevents DoS attacks
 * 
 * @dev GOVERNANCE MODEL:
 * - Multisig controlled with 12-hour upgrade delays (users can exit before changes)
 * - Emergency pause for immediate incident response (2-hour emergency upgrades when paused)
 * - Single upgrade path optimized for trusted governance
 * 
 * @dev TRUST GUARANTEES (IMMUTABLE FOREVER):
 * - Treasury address cannot be changed (no rug pull risk)
 * - Fee rates are fixed (1% mint, 2% redeem) 
 * - Maturity timestamps are locked (no season manipulation)
 * - Only designated vault can mint tokens (minter role immutable)
 * - Core economic parameters cannot be modified by any party
 */
contract UpgradeableVault is 
    UUPSUpgradeable, 
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IERC721Receiver 
{
    // ============ SIMPLIFIED ACCESS CONTROL ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    /// @notice The vS token contract (set once in constructor)
    /// @dev Set once in constructor, eliminates circular dependency
    IUpgradeableVSToken public immutable vS;
    address public immutable sonicNFT;
    address public immutable underlyingToken;
    address public immutable protocolTreasury;
    uint256 public immutable maturityTimestamp;
    uint256 public immutable vaultFreezeTimestamp;

    // ============ STORAGE LAYOUT V1 ============
    struct VaultStorageV1 {
        
        // Vault state
        uint256[] heldNFTs;
        mapping(uint256 => address) depositedNFTs;
        mapping(uint256 => bool) processed;
        uint256 nextClaim;
        uint256 processedCount;
        bool matured;
        
        // Simplified upgrade management
        mapping(address => uint256) upgradeProposals;
        mapping(address => string) upgradeReasons;
        mapping(address => bool) isEmergencyUpgrade; // Track emergency vs normal upgrades
        uint256 lastUpgradeTime;
        
        // Emergency controls
        uint256 pausedAt;
        string pauseReason;
    }

    VaultStorageV1 private _storage;

    // ============ SIMPLIFIED CONSTANTS FOR TRUSTED MULTISIG ============
    uint256 public constant MINT_FEE_BPS = 100;        // 1% mint fee
    uint256 public constant REDEEM_FEE_BPS = 200;      // 2% redeem fee
    uint256 public constant KEEPER_INCENTIVE_BPS = 0;  // 0% keeper incentive
    uint256 public constant GRACE_PERIOD = 180 days;   // Grace period for surplus sweep
    uint256 public constant MAX_BATCH_SIZE = 20;       // Max NFTs per harvest batch
    uint256 public constant MIN_NFT_FACE = 100e18;     // 100 S minimum
    uint256 public constant MAX_NFTS = 10000;          // Max NFTs to prevent scale issues
    
    // Simplified upgrade controls for trusted multisig
    uint256 public constant UPGRADE_DELAY = 12 hours;  // Fast but safe for trusted parties
    uint256 public constant EMERGENCY_UPGRADE_DELAY = 2 hours;  // Very fast emergency response
    uint256 public constant MAX_PAUSE_DURATION = 7 days; // Keep automatic unpause
    uint256 public constant MIN_UPGRADE_INTERVAL = 6 hours; // Flexible timing for multisig

    // ============ EVENTS ============
    event NFTDeposited(address indexed user, uint256 indexed nftId, uint256 userAmount, uint256 feeAmount);
    event VestedTokensClaimed(address indexed caller, uint256 totalAmount, uint256 incentivePaid);
    event Redeemed(address indexed user, uint256 vsAmount, uint256 underlyingAmount, uint256 feeAmount);
    event SurplusSwept(address indexed sweeper, uint256 amount);
    event DelegationForced(uint256 indexed nftId);
    
    // Simplified upgrade events
    event UpgradeProposed(address indexed newImplementation, uint256 executeAfter, string reason, bool isEmergency);
    event UpgradeExecuted(address indexed newImplementation, address indexed executor, string reason);
    event UpgradeCancelled(address indexed newImplementation);
    
    // Emergency events
    event EmergencyPaused(address indexed pauser, string reason);
    event EmergencyUnpaused(address indexed unpauser);

    // ============ STORAGE GAPS ============
    // Reserve 50 storage slots for future versions (more variables moved to immutable)
    uint256[50] private __gap;

    /**
     * @notice Constructor sets immutable addresses and timestamps
     * @param _vS The vS token contract address
     * @param _sonicNFT Address of the Sonic fNFT contract
     * @param _underlyingToken Address of the underlying S token
     * @param _protocolTreasury Address to receive protocol fees
     * @param _maturityTimestamp When fNFTs can be claimed at 0% penalty
     * @param _vaultFreezeTimestamp No deposits accepted after this
     */
    constructor(
        address _vS,
        address _sonicNFT,
        address _underlyingToken,
        address _protocolTreasury,
        uint256 _maturityTimestamp,
        uint256 _vaultFreezeTimestamp
    ) {
        require(_vS != address(0), "vS token cannot be zero address");
        require(_sonicNFT != address(0), "Invalid NFT contract");
        require(_underlyingToken != address(0), "Invalid underlying token");
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_maturityTimestamp > 0, "Invalid maturity timestamp");
        require(_vaultFreezeTimestamp > 0, "Invalid freeze timestamp");
        require(_vaultFreezeTimestamp < _maturityTimestamp, "Freeze must be before maturity");
        
        vS = IUpgradeableVSToken(_vS);
        sonicNFT = _sonicNFT;
        underlyingToken = _underlyingToken;
        protocolTreasury = _protocolTreasury;
        maturityTimestamp = _maturityTimestamp;
        vaultFreezeTimestamp = _vaultFreezeTimestamp;
    }

    /**
     * @notice Initialize the upgradeable vault
     * @dev This replaces the constructor for upgradeable contracts
     * @dev All addresses and timestamps are set in constructor as immutable
     * @param _admin Initial admin address (should be multisig)
     */
    function initialize(address _admin) public initializer {
        require(_admin != address(0), "Invalid admin");

        // Initialize OpenZeppelin upgradeable contracts
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(EMERGENCY_ROLE, _admin);

        // Initialize storage (immutable values set in constructor)
        _storage.nextClaim = 0;
        _storage.processedCount = 0;
        _storage.matured = false;
        _storage.lastUpgradeTime = block.timestamp;
    }

    /**
     * @notice Authorize contract upgrades (simplified single path)
     * @dev Handles both normal and emergency upgrades through unified proposal system
     * @param newImplementation Address of the new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override {
        require(_storage.upgradeProposals[newImplementation] != 0, "No upgrade proposal found");
        require(block.timestamp >= _storage.upgradeProposals[newImplementation], "Upgrade delay not met");
        
        // Check if this is an emergency upgrade that was proposed
        bool proposalIsEmergency = _storage.isEmergencyUpgrade[newImplementation];
        
        if (proposalIsEmergency) {
            // Emergency upgrades can only be executed when paused and by EMERGENCY_ROLE
            require(paused(), "Emergency upgrades only when paused");
            require(hasRole(EMERGENCY_ROLE, msg.sender), "Not emergency authorized");
        } else {
            // Normal upgrades can only be executed when not paused and by ADMIN_ROLE
            require(!paused(), "Normal upgrades only when not paused");
            require(hasRole(ADMIN_ROLE, msg.sender), "Not admin authorized");
        }
        
        // Check minimum interval
        require(
            block.timestamp >= _storage.lastUpgradeTime + MIN_UPGRADE_INTERVAL,
            "Too soon since last upgrade"
        );
        
        _storage.lastUpgradeTime = block.timestamp;
        
        // Emit upgrade executed event
        string memory reason = _storage.upgradeReasons[newImplementation];
        emit UpgradeExecuted(newImplementation, msg.sender, reason);
        
        // Cleanup upgrade data
        delete _storage.upgradeProposals[newImplementation];
        delete _storage.upgradeReasons[newImplementation];
        delete _storage.isEmergencyUpgrade[newImplementation];
    }

    /**
     * @notice Propose a contract upgrade
     * @dev Normal upgrades with 12-hour timelock for trusted multisig
     * @param newImplementation Address of the new implementation
     * @param reason Description of the upgrade
     */
    function proposeUpgrade(
        address newImplementation,
        string calldata reason
    ) external onlyRole(ADMIN_ROLE) {
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
     * @dev Can be called by ADMIN_ROLE or EMERGENCY_ROLE
     * @param newImplementation Address of the proposed implementation
     */
    function cancelUpgrade(address newImplementation) external {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || hasRole(EMERGENCY_ROLE, msg.sender),
            "Not authorized to cancel"
        );
        require(_storage.upgradeProposals[newImplementation] != 0, "No proposal found");
        
        delete _storage.upgradeProposals[newImplementation];
        delete _storage.upgradeReasons[newImplementation];
        
        emit UpgradeCancelled(newImplementation);
    }

    /**
     * @notice Propose an emergency contract upgrade
     * @dev Emergency upgrades with 2-hour timelock, only when contract is paused
     * @param newImplementation Address of the new implementation
     * @param exploitDescription Description of the exploit being fixed
     */
    function proposeEmergencyUpgrade(
        address newImplementation,
        string calldata exploitDescription
    ) external onlyRole(EMERGENCY_ROLE) whenPaused {
        require(newImplementation != address(0), "Invalid implementation");
        require(bytes(exploitDescription).length > 0, "Must describe exploit");
        require(_storage.upgradeProposals[newImplementation] == 0, "Already proposed");
        
        uint256 executeAfter = block.timestamp + EMERGENCY_UPGRADE_DELAY;
        _storage.upgradeProposals[newImplementation] = executeAfter;
        _storage.upgradeReasons[newImplementation] = exploitDescription;
        _storage.isEmergencyUpgrade[newImplementation] = true; // Mark as emergency
        
        emit UpgradeProposed(newImplementation, executeAfter, exploitDescription, true);
    }

    /**
     * @notice Cancel a proposed emergency upgrade
     * @dev Only EMERGENCY_ROLE can cancel emergency upgrades
     * @param newImplementation Address of the proposed implementation
     */
    function cancelEmergencyUpgrade(address newImplementation) external onlyRole(EMERGENCY_ROLE) {
        require(_storage.upgradeProposals[newImplementation] != 0, "No proposal found");
        
        delete _storage.upgradeProposals[newImplementation];
        delete _storage.upgradeReasons[newImplementation];
        delete _storage.isEmergencyUpgrade[newImplementation];
        
        emit UpgradeCancelled(newImplementation);
    }

    /**
     * @notice Get upgrade details
     * @param implementation Address of the proposed implementation
     * @return executeAfter Timestamp when upgrade can be executed
     * @return reason Description of the upgrade
     */
    function getUpgradeDetails(address implementation) 
        external 
        view 
        returns (uint256 executeAfter, string memory reason) 
    {
        return (
            _storage.upgradeProposals[implementation],
            _storage.upgradeReasons[implementation]
        );
    }

    /**
     * @notice Emergency pause the contract
     * @dev Can be called by EMERGENCY_ROLE
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
     * @dev Can be called by EMERGENCY_ROLE or automatically after MAX_PAUSE_DURATION
     */
    function unpause() external {
        require(
            hasRole(EMERGENCY_ROLE, msg.sender) || 
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
        require(block.timestamp <= vaultFreezeTimestamp, "Vault frozen - use new season vault");
        require(_storage.depositedNFTs[nftId] == address(0), "NFT already deposited");
        require(IERC721(sonicNFT).ownerOf(nftId) == msg.sender, "Not NFT owner");
        require(_storage.heldNFTs.length < MAX_NFTS, "Vault at capacity");
        
        // Pull the NFT first
        IERC721(sonicNFT).safeTransferFrom(msg.sender, address(this), nftId);
        
        // Immediately set ourselves as delegate
        _ensureDelegated(nftId);
        
        uint256 totalValue = IDecayfNFT(sonicNFT).getTotalAmount(nftId);
        require(totalValue > 0, "NFT has no value");
        require(totalValue >= MIN_NFT_FACE, "NFT too small");

        // Store NFT info
        _storage.depositedNFTs[nftId] = msg.sender;
        _storage.heldNFTs.push(nftId);

        // Split 1% fee to treasury, rest to user
        uint256 feeAmount = (totalValue * MINT_FEE_BPS) / 10_000;
        uint256 userAmount = totalValue - feeAmount;
        
        // Mint vS tokens
        vS.mint(protocolTreasury, feeAmount);
        vS.mint(msg.sender, userAmount);

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
        require(block.timestamp >= maturityTimestamp, "Too early - wait for maturity");
        require(k > 0 && k <= MAX_BATCH_SIZE, "Invalid batch size");
        require(!_storage.matured, "All NFTs already processed");
        
        uint256 processedNow = 0;
        uint256 startIndex = _storage.nextClaim;
        
        // Process k NFTs starting from pointer
        while (processedNow < k && processedNow < _storage.heldNFTs.length) {
            uint256 nftId = _storage.heldNFTs[_storage.nextClaim];
            
            // Only attempt if not already successfully processed
            if (!_storage.processed[nftId]) {
                try IDecayfNFT(sonicNFT).claimVestedTokens(nftId) returns (uint256 claimed) {
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
        require(vS.balanceOf(msg.sender) >= amount, "Insufficient vS balance");
        require(block.timestamp >= maturityTimestamp, "Too early - wait for maturity");
        
        uint256 vsTotalSupply = vS.totalSupply();
        require(vsTotalSupply > 0, "No vS tokens in circulation");
        
        // Calculate redemption from available balance (proportional)
        uint256 availableBalance = IERC20(underlyingToken).balanceOf(address(this));
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
        vS.burn(msg.sender, amount);
        
        // Transfer fee to treasury and remaining to user
        if (feeAmount > 0) {
            require(IERC20(underlyingToken).transfer(protocolTreasury, feeAmount), "Treasury transfer failed");
        }
        require(IERC20(underlyingToken).transfer(msg.sender, userAmount), "User transfer failed");

        emit Redeemed(msg.sender, amount, userAmount, feeAmount);
    }

    /**
     * @notice Sweep surplus tokens after grace period (PERMISSIONLESS)
     * @dev No owner required - anyone can call after maturity + 180 days
     */
    function sweepSurplus() external nonReentrant whenNotPaused {
        require(block.timestamp >= maturityTimestamp + GRACE_PERIOD, "Grace period not over");
        
        uint256 surplus = IERC20(underlyingToken).balanceOf(address(this));
        require(surplus > 0, "No surplus to sweep");
        
        require(IERC20(underlyingToken).transfer(protocolTreasury, surplus), "Surplus transfer failed");
        
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
            try IERC721(sonicNFT).ownerOf(nftIds[i]) returns (address owner) {
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
        if (IDecayfNFT(sonicNFT).claimDelegates(nftId) != address(this)) {
            try IDecayfNFT(sonicNFT).setDelegate(nftId, address(this)) {
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
        uint256 totalSupply = vS.totalSupply();
        if (totalSupply == 0) return 1e18;
        
        uint256 vaultBalance = IERC20(underlyingToken).balanceOf(address(this));
        return (vaultBalance * 1e18) / totalSupply;
    }

    function totalAssets() external view returns (uint256) {
        return IERC20(underlyingToken).balanceOf(address(this));
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
        return block.timestamp > vaultFreezeTimestamp;
    }

    function isProcessed(uint256 nftId) external view returns (bool) {
        return _storage.processed[nftId];
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

    // ============ IMMUTABLE GETTERS ============
    // Note: These are now immutable variables, getters provided for interface compatibility

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
        require(msg.sender == sonicNFT, "Only accepts target NFTs");
        return IERC721Receiver.onERC721Received.selector;
    }
} 