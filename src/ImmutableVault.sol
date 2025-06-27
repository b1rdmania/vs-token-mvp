// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {ERC721Holder} from "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {VSToken} from "./VSToken.sol";

interface IDecayfNFT is IERC721 {
    function claimDelegates(uint256 tokenId) external view returns (address);
    function getTotalAmount(uint256 tokenId) external view returns (uint256);
    function claimable(uint256 tokenId) external view returns (uint256);
    function claimVestedTokens(uint256 tokenId) external returns (uint256);
}

/**
 * @title ImmutableVault
 * @notice Truly immutable vault with zero admin controls after deployment
 * @dev All parameters set in constructor and cannot be changed
 */
contract ImmutableVault is ERC721Holder, ReentrancyGuard {
    // ============ IMMUTABLE STATE ============
    VSToken public immutable vS;
    address public immutable sonicNFT;
    address public immutable underlyingToken;
    address public immutable protocolTreasury;
    uint256 public immutable maturityTimestamp;
    
    // ============ CONSTANTS ============
    uint256 public constant KEEPER_INCENTIVE_BPS = 5;    // 0.05%
    uint256 public constant PROTOCOL_FEE_BPS = 100;      // 1%
    
    // ============ STATE ============
    uint256[] public heldNFTs;
    mapping(uint256 => address) public depositedNFTs;
    bool public matured = false;

    // ============ EVENTS ============
    event NFTDeposited(address indexed user, uint256 indexed nftId, uint256 amountMinted);
    event VestedTokensClaimed(address indexed caller, uint256 totalAmount, uint256 incentivePaid);
    event Redeemed(address indexed user, uint256 vsAmount, uint256 underlyingAmount);
    event MaturityTriggered(address indexed triggeredBy, uint256 totalClaimed);

    /**
     * @notice Deploy immutable vault - all parameters fixed forever
     * @param _vsToken Address of the vS token contract
     * @param _sonicNFT Address of the Sonic fNFT contract  
     * @param _underlyingToken Address of the underlying S token
     * @param _protocolTreasury Address to receive protocol fees (immutable)
     * @param _maturityTimestamp When fNFTs can be claimed at 0% penalty
     */
    constructor(
        address _vsToken,
        address _sonicNFT, 
        address _underlyingToken,
        address _protocolTreasury,
        uint256 _maturityTimestamp
    ) {
        require(_vsToken != address(0), "Invalid vS token");
        require(_sonicNFT != address(0), "Invalid NFT contract");
        require(_underlyingToken != address(0), "Invalid underlying token");
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_maturityTimestamp > block.timestamp, "Maturity must be future");
        
        vS = VSToken(_vsToken);
        sonicNFT = _sonicNFT;
        underlyingToken = _underlyingToken;
        protocolTreasury = _protocolTreasury;
        maturityTimestamp = _maturityTimestamp;
    }

    /**
     * @notice Deposit fNFT and mint full-value vS tokens
     * @dev Requires prior delegation of claim rights to this vault
     * @param nftId ID of the fNFT to deposit
     */
    function deposit(uint256 nftId) external nonReentrant {
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
     * @notice Batch deposit multiple fNFTs
     * @param nftIds Array of NFT IDs to deposit
     */
    function batchDeposit(uint256[] calldata nftIds) external nonReentrant {
        require(nftIds.length > 0 && nftIds.length <= 10, "Invalid batch size");
        
        uint256 totalValueToMint = 0;
        
        // Validate all NFTs first
        for (uint256 i = 0; i < nftIds.length; i++) {
            uint256 nftId = nftIds[i];
            require(depositedNFTs[nftId] == address(0), "NFT already deposited");
            require(IERC721(sonicNFT).ownerOf(nftId) == msg.sender, "Not NFT owner");
            require(
                IDecayfNFT(sonicNFT).claimDelegates(nftId) == address(this),
                "Must delegate claiming rights first"
            );
            
            uint256 nftValue = IDecayfNFT(sonicNFT).getTotalAmount(nftId);
            require(nftValue > 0, "NFT has no value");
            totalValueToMint += nftValue;
        }
        
        // Store all NFTs
        for (uint256 i = 0; i < nftIds.length; i++) {
            uint256 nftId = nftIds[i];
            depositedNFTs[nftId] = msg.sender;
            heldNFTs.push(nftId);
            
            uint256 nftValue = IDecayfNFT(sonicNFT).getTotalAmount(nftId);
            emit NFTDeposited(msg.sender, nftId, nftValue);
        }
        
        // Single mint for gas efficiency
        vS.mint(msg.sender, totalValueToMint);
    }

    /**
     * @notice Public function to claim vested tokens from fNFTs
     * @dev Anyone can call this - keeper gets small incentive
     * @param startIndex Starting index in heldNFTs array
     * @param count Number of NFTs to process
     */
    function claimVested(uint256 startIndex, uint256 count) external nonReentrant {
        uint256 totalClaimed = 0;
        uint256 endIndex = startIndex + count;
        require(endIndex <= heldNFTs.length, "Index out of bounds");

        for (uint256 i = startIndex; i < endIndex; i++) {
            uint256 nftId = heldNFTs[i];
            require(depositedNFTs[nftId] != address(0), "NFT not deposited");
            
            uint256 claimableAmount = IDecayfNFT(sonicNFT).claimable(nftId);
            if (claimableAmount > 0) {
                try IDecayfNFT(sonicNFT).claimVestedTokens(nftId) returns (uint256 vested) {
                    totalClaimed += vested;
                } catch {
                    continue; // Skip failed claims
                }
            }
        }
        
        if (totalClaimed == 0) return;

        // Pay keeper incentive
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
        
        // Trigger maturity if we've reached it and haven't claimed yet
        if (!matured && block.timestamp >= maturityTimestamp) {
            _triggerMaturity();
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
     * @notice Internal function to claim all fNFTs at maturity (0% penalty)
     * @dev Called automatically on first redemption after maturity
     */
    function _triggerMaturity() internal {
        uint256 totalClaimed = 0;
        
        // Claim from all held fNFTs
        for (uint256 i = 0; i < heldNFTs.length; i++) {
            uint256 nftId = heldNFTs[i];
            try IDecayfNFT(sonicNFT).claimVestedTokens(nftId) returns (uint256 claimed) {
                totalClaimed += claimed;
            } catch {
                continue; // Skip failed claims
            }
        }
        
        matured = true;
        emit MaturityTriggered(msg.sender, totalClaimed);
    }

    /**
     * @notice View function to check if vault has matured
     */
    function hasMatured() external view returns (bool) {
        return matured || block.timestamp >= maturityTimestamp;
    }

    /**
     * @notice View function to get total assets held by vault
     */
    function totalAssets() external view returns (uint256) {
        return IERC20(underlyingToken).balanceOf(address(this));
    }

    /**
     * @notice View function to get number of held NFTs
     */
    function getHeldNFTCount() external view returns (uint256) {
        return heldNFTs.length;
    }

    /**
     * @notice View function to get held NFT by index
     */
    function getHeldNFT(uint256 index) external view returns (uint256) {
        require(index < heldNFTs.length, "Index out of bounds");
        return heldNFTs[index];
    }
} 