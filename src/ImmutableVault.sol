// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {ERC721Holder} from "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {ImmutableVSToken} from "./ImmutableVSToken.sol";

interface IDecayfNFT is IERC721 {
    function claimDelegates(uint256 tokenId) external view returns (address);
    function getTotalAmount(uint256 tokenId) external view returns (uint256);
    function claimable(uint256 tokenId) external view returns (uint256);
    function claimVestedTokens(uint256 tokenId) external returns (uint256);
}

/**
 * @title ImmutableVault - Ultra-Minimal Design
 * @notice Truly immutable vault with zero admin controls after deployment
 * @dev Four functions: deposit, claimBatch, redeem, sweepSurplus - no owner, no upgrades
 */
contract ImmutableVault is ERC721Holder, ReentrancyGuard {
    // ============ IMMUTABLE STATE ============
    ImmutableVSToken public immutable vS;
    address public immutable sonicNFT;
    address public immutable underlyingToken;
    address public immutable protocolTreasury;
    uint256 public immutable maturityTimestamp;
    uint256 public immutable vaultFreezeTimestamp;  // No deposits after this
    
    // ============ CONSTANTS ============
    uint256 public constant KEEPER_INCENTIVE_BPS = 5;    // 0.05%
    uint256 public constant PROTOCOL_FEE_BPS = 100;      // 1%
    uint256 public constant GRACE_PERIOD = 180 days;     // Grace before sweep
    
    // ============ MINIMAL STATE ============
    uint256[] public heldNFTs;
    mapping(uint256 => address) public depositedNFTs;
    uint256 public nextClaimIndex = 0;    // Rolling pointer for batch claims
    bool public matured = false;

    // ============ EVENTS ============
    event NFTDeposited(address indexed user, uint256 indexed nftId, uint256 amountMinted);
    event VestedTokensClaimed(address indexed caller, uint256 totalAmount, uint256 incentivePaid);
    event Redeemed(address indexed user, uint256 vsAmount, uint256 underlyingAmount);
    event MaturityTriggered(address indexed triggeredBy, uint256 totalClaimed);
    event RedemptionBounty(address indexed redeemer, uint256 gasUsed);  // For manual tips
    event SurplusSwept(address indexed sweeper, uint256 amount);

    /**
     * @notice Deploy immutable vault - all parameters fixed forever
     * @param _vsToken Address of the vS token contract
     * @param _sonicNFT Address of the Sonic fNFT contract  
     * @param _underlyingToken Address of the underlying S token
     * @param _protocolTreasury Address to receive protocol fees (immutable)
     * @param _maturityTimestamp When fNFTs can be claimed at 0% penalty
     * @param _vaultFreezeTimestamp No deposits accepted after this (prevents season mixing)
     */
    constructor(
        address _vsToken,
        address _sonicNFT, 
        address _underlyingToken,
        address _protocolTreasury,
        uint256 _maturityTimestamp,
        uint256 _vaultFreezeTimestamp
    ) {
        require(_vsToken != address(0), "Invalid vS token");
        require(_sonicNFT != address(0), "Invalid NFT contract");
        require(_underlyingToken != address(0), "Invalid underlying token");
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_maturityTimestamp > block.timestamp, "Maturity must be future");
        require(_vaultFreezeTimestamp > block.timestamp, "Freeze must be future");
        require(_vaultFreezeTimestamp < _maturityTimestamp, "Freeze before maturity");
        
        vS = ImmutableVSToken(_vsToken);
        sonicNFT = _sonicNFT;
        underlyingToken = _underlyingToken;
        protocolTreasury = _protocolTreasury;
        maturityTimestamp = _maturityTimestamp;
        vaultFreezeTimestamp = _vaultFreezeTimestamp;
    }

    /**
     * @notice Deposit fNFT and mint full-value vS tokens
     * @dev Requires prior delegation of claim rights to this vault
     * @param nftId ID of the fNFT to deposit
     */
    function deposit(uint256 nftId) external nonReentrant {
        require(block.timestamp <= vaultFreezeTimestamp, "Vault frozen - use new season vault");
        require(depositedNFTs[nftId] == address(0), "NFT already deposited");
        require(IERC721(sonicNFT).ownerOf(nftId) == msg.sender, "Not NFT owner");
        require(
            IDecayfNFT(sonicNFT).claimDelegates(nftId) == address(this),
            "Must delegate claiming rights first"
        );
        
        uint256 totalValue = IDecayfNFT(sonicNFT).getTotalAmount(nftId);
        require(totalValue > 0, "NFT has no value");

        // Store NFT info
        depositedNFTs[nftId] = msg.sender;
        heldNFTs.push(nftId);

        // Mint 1:1 vS tokens for full future value
        vS.mint(msg.sender, totalValue);

        emit NFTDeposited(msg.sender, nftId, totalValue);
    }

    /**
     * @notice Batch claim vested tokens using rolling pointer (gas-bomb proof)
     * @dev Anyone can call - processes k NFTs from nextClaimIndex, updates pointer
     * @param k Number of NFTs to process (bounded for gas safety)
     */
    function claimBatch(uint256 k) external nonReentrant {
        require(k > 0 && k <= 50, "Invalid batch size");
        require(nextClaimIndex < heldNFTs.length, "All NFTs processed");
        
        uint256 totalClaimed = 0;
        uint256 processed = 0;
        
        // Process k NFTs starting from pointer
        while (processed < k && nextClaimIndex < heldNFTs.length) {
            uint256 nftId = heldNFTs[nextClaimIndex];
            
            uint256 claimableAmount = IDecayfNFT(sonicNFT).claimable(nftId);
            if (claimableAmount > 0) {
                try IDecayfNFT(sonicNFT).claimVestedTokens(nftId) returns (uint256 vested) {
                    totalClaimed += vested;
                } catch {
                    // Skip failed claims, continue processing
                }
            }
            
            nextClaimIndex++;
            processed++;
        }
        
        if (totalClaimed == 0) return;

        // Pay keeper incentive from vault balance
        uint256 incentiveAmount = (totalClaimed * KEEPER_INCENTIVE_BPS) / 10_000;
        if (incentiveAmount > 0) {
            uint256 vaultBalance = IERC20(underlyingToken).balanceOf(address(this));
            if (vaultBalance >= incentiveAmount) {
                IERC20(underlyingToken).transfer(msg.sender, incentiveAmount);
            }
        }

        emit VestedTokensClaimed(msg.sender, totalClaimed, incentiveAmount);
    }

    /**
     * @notice Redeem vS tokens for underlying S tokens
     * @dev Triggers one-time maturity claim if not done yet
     * @param amount Amount of vS tokens to burn
     */
    function redeem(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot redeem 0");
        require(vS.balanceOf(msg.sender) >= amount, "Insufficient vS balance");
        
        uint256 gasStart = gasleft();
        
        // Trigger maturity if we've reached it and haven't claimed yet
        if (!matured && block.timestamp >= maturityTimestamp) {
            _triggerMaturity();
            
            // Emit gas bounty event for manual tips by front-ends
            uint256 gasUsed = gasStart - gasleft();
            emit RedemptionBounty(msg.sender, gasUsed);
        }
        
        uint256 vsTotalSupply = vS.totalSupply();
        require(vsTotalSupply > 0, "No vS tokens in circulation");
        
        // Calculate redemption from available balance
        uint256 availableBalance = IERC20(underlyingToken).balanceOf(address(this));
        require(availableBalance > 0, "No tokens available for redemption");
        
        uint256 redeemableValue = (amount * availableBalance) / vsTotalSupply;
        
        // Calculate protocol fee
        uint256 protocolFee = (redeemableValue * PROTOCOL_FEE_BPS) / 10_000;
        uint256 userAmount = redeemableValue - protocolFee;
        
        // Burn vS tokens
        vS.burn(msg.sender, amount);
        
        // Transfer protocol fee to treasury
        if (protocolFee > 0) {
            IERC20(underlyingToken).transfer(protocolTreasury, protocolFee);
        }
        
        // Transfer tokens to user
        IERC20(underlyingToken).transfer(msg.sender, userAmount);

        emit Redeemed(msg.sender, amount, userAmount);
    }

    /**
     * @notice Sweep surplus tokens after grace period (PERMISSIONLESS)
     * @dev No owner required - anyone can call after maturity + 180 days
     */
    function sweepSurplus() external nonReentrant {
        require(block.timestamp >= maturityTimestamp + GRACE_PERIOD, "Grace period not over");
        
        uint256 surplus = IERC20(underlyingToken).balanceOf(address(this));
        require(surplus > 0, "No surplus to sweep");
        
        // Transfer surplus to treasury (or could burn if treasury is burn address)
        IERC20(underlyingToken).transfer(protocolTreasury, surplus);
        
        emit SurplusSwept(msg.sender, surplus);
    }

    /**
     * @notice Internal function to claim all remaining fNFTs at maturity (0% penalty)
     * @dev Called automatically on first redemption after maturity
     */
    function _triggerMaturity() internal {
        uint256 totalClaimed = 0;
        
        // Claim from all remaining unheld fNFTs (from nextClaimIndex onward)
        for (uint256 i = nextClaimIndex; i < heldNFTs.length; i++) {
            uint256 nftId = heldNFTs[i];
            try IDecayfNFT(sonicNFT).claimVestedTokens(nftId) returns (uint256 claimed) {
                totalClaimed += claimed;
            } catch {
                continue; // Skip failed claims
            }
        }
        
        // Mark all as processed
        nextClaimIndex = heldNFTs.length;
        matured = true;
        
        emit MaturityTriggered(msg.sender, totalClaimed);
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Check if vault has matured
     */
    function hasMatured() external view returns (bool) {
        return matured || block.timestamp >= maturityTimestamp;
    }

    /**
     * @notice Get total assets held by vault
     */
    function totalAssets() external view returns (uint256) {
        return IERC20(underlyingToken).balanceOf(address(this));
    }

    /**
     * @notice Get number of held NFTs
     */
    function getHeldNFTCount() external view returns (uint256) {
        return heldNFTs.length;
    }

    /**
     * @notice Get held NFT by index
     */
    function getHeldNFT(uint256 index) external view returns (uint256) {
        require(index < heldNFTs.length, "Index out of bounds");
        return heldNFTs[index];
    }

    /**
     * @notice Get claim progress (how many NFTs processed)
     */
    function getClaimProgress() external view returns (uint256 processed, uint256 total) {
        return (nextClaimIndex, heldNFTs.length);
    }

    /**
     * @notice Check if vault is frozen for new deposits
     */
    function isVaultFrozen() external view returns (bool) {
        return block.timestamp > vaultFreezeTimestamp;
    }
} 