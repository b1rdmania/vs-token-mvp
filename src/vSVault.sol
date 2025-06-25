// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {ERC721Holder} from "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC721} from "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "openzeppelin-contracts/contracts/utils/Pausable.sol";
import {VSToken} from "./VSToken.sol";
import {MockSonicNFT} from "../test/MockSonicNFT.sol";

/**
 * @title vSVault
 * @dev A vault that permanently locks Sonic vesting NFTs (fNFTs)
 * and mints vS tokens against their full future value.
 * This contract then collects vested tokens from the fNFTs over time,
 * allowing vS holders to redeem them for the underlying asset.
 */
contract vSVault is ERC721Holder, Ownable, ReentrancyGuard, Pausable {
    VSToken public vS;
    address public sonicNFT;
    address public immutable underlyingToken; // The actual token being vested, e.g. SONIC

    // Keep track of all NFTs held by the vault to claim from them
    uint256[] public heldNFTs;

    // 5 Basis Points (0.05%) as a keeper reward
    uint256 public constant KEEPER_INCENTIVE_BPS = 5;

    /// @notice Emitted when an NFT is deposited and vS is minted
    event NFTDeposited(address indexed user, uint256 indexed nftId, uint256 amountMinted);
    /// @notice Emitted when the vault claims vested tokens from the fNFTs
    event VestedTokensClaimed(address indexed caller, uint256 totalAmount, uint256 incentivePaid);
    /// @notice Emitted when a user redeems vS for the underlying token
    event Redeemed(address indexed user, uint256 vsAmount, uint256 underlyingAmount);
    /// @notice Emitted when the owner sets the fNFT contract address
    event NFTContractSet(address indexed nftContract);

    /**
     * @param _vsToken The address of the vS token contract.
     * @param _underlyingToken The address of the underlying asset being vested (e.g., SONIC).
     */
    constructor(
        address _vsToken,
        address _underlyingToken
    ) Ownable(msg.sender) {
        vS = VSToken(_vsToken);
        underlyingToken = _underlyingToken;
    }

    /**
     * @notice Sets the official fNFT contract address.
     * @dev Can only be called once by the owner. This is a critical security step
     * to ensure the vault only ever interacts with a verified, audited fNFT contract.
     * @param _sonicNFT The address of the Sonic vesting NFT contract.
     */
    function setNFTContract(address _sonicNFT) external onlyOwner {
        require(sonicNFT == address(0), "NFT contract already set");
        require(_sonicNFT != address(0), "NFT contract cannot be zero address");
        sonicNFT = _sonicNFT;
        emit NFTContractSet(_sonicNFT);
    }

    /**
     * @notice Deposits an fNFT and mints vS tokens for its full future value.
     * @dev This is a one-way bridge. The NFT is permanently locked.
     * @param nftId The ID of the Sonic NFT to deposit.
     */
    function deposit(uint256 nftId) external nonReentrant whenNotPaused {
        require(sonicNFT != address(0), "NFT contract not set");
        // 1. Take ownership of the NFT
        IERC721(sonicNFT).safeTransferFrom(msg.sender, address(this), nftId);
        heldNFTs.push(nftId);

        // 2. Calculate its total potential value
        uint256 totalValue = MockSonicNFT(sonicNFT).getTotalAmount(nftId);
        require(totalValue > 0, "NFT has no value");

        // 3. Mint vS tokens 1:1 for the total future value
        vS.mint(msg.sender, totalValue);

        emit NFTDeposited(msg.sender, nftId, totalValue);
    }

    /**
     * @notice Claims currently vested tokens from a batch of NFTs held by the vault.
     * @dev This is a public function that should be called periodically by a keeper or incentivized actor.
     * The collected tokens are held by this contract for redemption.
     * @param startIndex The starting index in the heldNFTs array to process.
     * @param count The number of NFTs to process in this batch.
     */
    function claimVested(uint256 startIndex, uint256 count) external {
        uint256 totalClaimed = 0;
        uint256 endIndex = startIndex + count;
        require(endIndex <= heldNFTs.length, "Index out of bounds");

        for (uint i = startIndex; i < endIndex; i++) {
            uint256 nftId = heldNFTs[i];
            // In a real scenario, the NFT contract would have a `claim` function
            // that transfers the vested tokens. We simulate this in our mock.
            uint256 vested = MockSonicNFT(sonicNFT).claimVestedTokens(nftId);
            if (vested > 0) {
                totalClaimed += vested;
            }
        }
        
        if (totalClaimed == 0) {
            // It's okay if there's nothing to claim in this batch, just return.
            return;
        }

        // The MockSonicNFT is responsible for transferring the `underlyingToken` to this vault.
        // We now pay the keeper a small incentive from the claimed amount.
        uint256 incentiveAmount = (totalClaimed * KEEPER_INCENTIVE_BPS) / 10_000;
        if (incentiveAmount > 0) {
            IERC20(underlyingToken).transfer(msg.sender, incentiveAmount);
        }

        emit VestedTokensClaimed(msg.sender, totalClaimed, incentiveAmount);
    }
    
    /**
     * @notice Burns vS tokens to redeem a proportional share of the underlying tokens held by the vault.
     * @param amount The amount of vS tokens to burn.
     */
    function redeem(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot redeem 0");
        
        // Calculate proportional share of underlying tokens held by the vault
        uint256 totalUnderlying = IERC20(underlyingToken).balanceOf(address(this));
        uint256 vsTotalSupply = vS.totalSupply();
        
        require(vsTotalSupply > 0, "No vS tokens in circulation");
        uint256 redeemableAmount = (amount * totalUnderlying) / vsTotalSupply;
        require(redeemableAmount > 0, "No underlying assets to redeem");

        // 1. Burn user's vS tokens first to prevent re-entrancy
        vS.burn(msg.sender, amount);
        
        // 2. Transfer underlying tokens to the user
        IERC20(underlyingToken).transfer(msg.sender, redeemableAmount);

        emit Redeemed(msg.sender, amount, redeemableAmount);
    }

    /**
     * @notice Emergency pause function for the owner
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause function for the owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev The total amount of redeemable assets held by the vault.
     */
    function totalAssets() public view returns (uint256) {
        return IERC20(underlyingToken).balanceOf(address(this));
    }
} 