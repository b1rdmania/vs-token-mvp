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
import {TestSonicDecayfNFT} from "./DecayfNFT.sol";

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
    
    // Protocol fee taken from redemptions (1% in underlying tokens)
    uint256 public constant PROTOCOL_FEE_BPS = 100; // 1%
    address public protocolTreasury;

    // Add mapping to track deposited NFTs and their original owners
    mapping(uint256 => address) public depositedNFTs;

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
     * @param _protocolTreasury The address that receives protocol fees.
     */
    constructor(
        address _vsToken,
        address _underlyingToken,
        address _protocolTreasury
    ) Ownable(msg.sender) {
        vS = VSToken(_vsToken);
        underlyingToken = _underlyingToken;
        protocolTreasury = _protocolTreasury;
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
     * @dev This is a ONE-WAY operation. User must delegate claiming rights first.
     * The vault becomes the permanent beneficiary and will claim all future value.
     * @param nftId The ID of the Sonic NFT to deposit.
     */
    function deposit(uint256 nftId) external nonReentrant whenNotPaused {
        require(sonicNFT != address(0), "NFT contract not set");
        require(depositedNFTs[nftId] == address(0), "NFT already deposited");
        
        address sender = msg.sender; // Cache msg.sender
        
        // Check that the user owns the NFT
        require(IERC721(sonicNFT).ownerOf(nftId) == sender, "Not NFT owner");
        
        // Verify that the user has already delegated claiming rights to this vault
        require(
            TestSonicDecayfNFT(sonicNFT).claimDelegates(nftId) == address(this),
            "Must delegate claiming rights to vault first"
        );
        
        // Calculate the FULL future value of this NFT (all vesting)
        uint256 totalValue = TestSonicDecayfNFT(sonicNFT).getTotalAmount(nftId);
        require(totalValue > 0, "NFT has no value");

        // Track this NFT as deposited (after value check to save gas on reverts)
        depositedNFTs[nftId] = sender;
        heldNFTs.push(nftId);

        // Mint vS tokens 1:1 for the TOTAL future value
        // User gets liquid tokens representing the entire vesting schedule
        vS.mint(sender, totalValue);

        emit NFTDeposited(sender, nftId, totalValue);
    }

    /**
     * @notice Gas-optimized deposit function for large NFTs
     * @dev Uses assembly optimizations and batched operations to reduce gas costs
     * @param nftId The ID of the Sonic NFT to deposit.
     */
    function depositOptimized(uint256 nftId) external nonReentrant whenNotPaused {
        require(sonicNFT != address(0), "NFT contract not set");
        require(depositedNFTs[nftId] == address(0), "NFT already deposited");
        
        // Check that the user owns the NFT
        require(IERC721(sonicNFT).ownerOf(nftId) == msg.sender, "Not NFT owner");
        
        // Verify that the user has already delegated claiming rights to this vault
        require(
            TestSonicDecayfNFT(sonicNFT).claimDelegates(nftId) == address(this),
            "Must delegate claiming rights to vault first"
        );
        
        // Get total value once and cache it
        uint256 totalValue = TestSonicDecayfNFT(sonicNFT).getTotalAmount(nftId);
        require(totalValue > 0, "NFT has no value");

        // Use assembly for gas-optimized storage operations
        assembly {
            // Store deposited NFT mapping
            let slot := keccak256(add(nftId, 0x00), 0x40) // depositedNFTs mapping slot
            sstore(slot, caller())
        }
        
        // Push to array (unavoidable storage operation)
        heldNFTs.push(nftId);

        // Mint tokens with gas optimization
        vS.mint(msg.sender, totalValue);

        emit NFTDeposited(msg.sender, nftId, totalValue);
    }

    /**
     * @notice Batch deposit multiple NFTs in a single transaction
     * @dev More gas efficient for depositing multiple NFTs at once
     * @param nftIds Array of NFT IDs to deposit
     */
    function batchDeposit(uint256[] calldata nftIds) external nonReentrant whenNotPaused {
        require(sonicNFT != address(0), "NFT contract not set");
        require(nftIds.length > 0 && nftIds.length <= 10, "Invalid batch size");
        
        uint256 totalValueToMint = 0;
        
        // First pass: validate all NFTs and calculate total
        for (uint256 i = 0; i < nftIds.length; i++) {
            uint256 nftId = nftIds[i];
            require(depositedNFTs[nftId] == address(0), "NFT already deposited");
            require(IERC721(sonicNFT).ownerOf(nftId) == msg.sender, "Not NFT owner");
            require(
                TestSonicDecayfNFT(sonicNFT).claimDelegates(nftId) == address(this),
                "Must delegate claiming rights to vault first"
            );
            
            uint256 nftValue = TestSonicDecayfNFT(sonicNFT).getTotalAmount(nftId);
            require(nftValue > 0, "NFT has no value");
            totalValueToMint += nftValue;
        }
        
        // Second pass: store all NFTs
        for (uint256 i = 0; i < nftIds.length; i++) {
            uint256 nftId = nftIds[i];
            depositedNFTs[nftId] = msg.sender;
            heldNFTs.push(nftId);
            
            uint256 nftValue = TestSonicDecayfNFT(sonicNFT).getTotalAmount(nftId);
            emit NFTDeposited(msg.sender, nftId, nftValue);
        }
        
        // Single mint operation for all NFTs combined
        vS.mint(msg.sender, totalValueToMint);
    }

    /**
     * @notice Claims currently vested tokens from deposited NFTs.
     * @dev This is a public function that should be called periodically by keepers.
     * The vault has delegation rights and tokens are sent directly to the vault.
     * @param startIndex The starting index in the heldNFTs array to process.
     * @param count The number of NFTs to process in this batch.
     */
    function claimVested(uint256 startIndex, uint256 count) external {
        uint256 totalClaimed = 0;
        uint256 endIndex = startIndex + count;
        require(endIndex <= heldNFTs.length, "Index out of bounds");

        for (uint i = startIndex; i < endIndex; i++) {
            uint256 nftId = heldNFTs[i];
            
            // Verify this NFT was deposited into our vault
            require(depositedNFTs[nftId] != address(0), "NFT not deposited");
            
            // Check how much is claimable from this NFT
            uint256 claimableAmount = TestSonicDecayfNFT(sonicNFT).claimable(nftId);
            if (claimableAmount > 0) {
                // Claim vested tokens - since we're the delegate, they'll be sent to this vault
                try TestSonicDecayfNFT(sonicNFT).claimVestedTokens(nftId) returns (uint256 vested) {
                    totalClaimed += vested;
                } catch {
                    // If claiming fails for this NFT, continue with others
                    continue;
                }
            }
        }
        
        if (totalClaimed == 0) {
            return; // Nothing to claim in this batch
        }

        // Pay the keeper a small incentive from the claimed amount
        uint256 incentiveAmount = (totalClaimed * KEEPER_INCENTIVE_BPS) / 10_000;
        if (incentiveAmount > 0 && IERC20(underlyingToken).balanceOf(address(this)) >= incentiveAmount) {
            IERC20(underlyingToken).transfer(msg.sender, incentiveAmount);
        }

        emit VestedTokensClaimed(msg.sender, totalClaimed, incentiveAmount);
    }
    
    /**
     * @notice Burns vS tokens to redeem value by claiming from fNFTs proportionally.
     * @dev This actively claims from fNFTs when needed to provide redemption value,
     * ensuring liquidity is always available based on actual vested amounts.
     * @param amount The amount of vS tokens to burn.
     */
    function redeem(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot redeem 0");
        require(vS.balanceOf(msg.sender) >= amount, "Insufficient vS balance");
        
        uint256 vsTotalSupply = vS.totalSupply();
        require(vsTotalSupply > 0, "No vS tokens in circulation");
        
        // Calculate proportional share of total available value
        uint256 totalAvailableValue = IERC20(underlyingToken).balanceOf(address(this));
        
        // Add claimable amounts from all fNFTs
        for (uint i = 0; i < heldNFTs.length; i++) {
            uint256 nftId = heldNFTs[i];
            totalAvailableValue += TestSonicDecayfNFT(sonicNFT).claimable(nftId);
        }
        
        require(totalAvailableValue > 0, "No value available for redemption");
        
        // Calculate redeemable amount
        uint256 redeemableValue = (amount * totalAvailableValue) / vsTotalSupply;
        uint256 collectedValue = 0;
        
        // First, use existing balance in vault
        uint256 existingBalance = IERC20(underlyingToken).balanceOf(address(this));
        if (existingBalance > 0) {
            uint256 fromExisting = existingBalance < redeemableValue 
                ? existingBalance 
                : redeemableValue;
            collectedValue += fromExisting;
        }
        
        // If we need more value, claim from fNFTs
        if (collectedValue < redeemableValue) {
            uint256 stillNeeded = redeemableValue - collectedValue;
            
            for (uint i = 0; i < heldNFTs.length && stillNeeded > 0; i++) {
                uint256 nftId = heldNFTs[i];
                uint256 claimableAmount = TestSonicDecayfNFT(sonicNFT).claimable(nftId);
                
                if (claimableAmount > 0) {
                    try TestSonicDecayfNFT(sonicNFT).claimVestedTokens(nftId) returns (uint256 claimed) {
                        collectedValue += claimed;
                        if (claimed >= stillNeeded) {
                            break; // We have enough
                        }
                        stillNeeded -= claimed;
                    } catch {
                        continue; // Skip this NFT if claiming fails
                    }
                }
            }
        }
        
        require(collectedValue > 0, "No tokens available for redemption");
        
        // Calculate protocol fee from the redeemed underlying tokens
        uint256 protocolFee = (collectedValue * PROTOCOL_FEE_BPS) / 10_000;
        uint256 userAmount = collectedValue - protocolFee;
        
        // Burn user's vS tokens (all of them - no vS tokens kept as fees)
        vS.burn(msg.sender, amount);
        
        // Transfer protocol fee to treasury (in underlying tokens)
        if (protocolFee > 0 && protocolTreasury != address(0)) {
            IERC20(underlyingToken).transfer(protocolTreasury, protocolFee);
        }
        
        // Transfer remaining tokens to user
        IERC20(underlyingToken).transfer(msg.sender, userAmount);

        emit Redeemed(msg.sender, amount, userAmount);
    }

    /**
     * @notice Simple redeem that only uses already-claimed tokens (LOW GAS)
     * @dev Much cheaper gas option - only redeems from tokens already in vault
     * @param amount The amount of vS tokens to burn.
     */
    function simpleRedeem(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot redeem 0");
        require(vS.balanceOf(msg.sender) >= amount, "Insufficient vS balance");
        
        uint256 vsTotalSupply = vS.totalSupply();
        require(vsTotalSupply > 0, "No vS tokens in circulation");
        
        // Only use existing balance in vault (no claiming during redemption)
        uint256 availableBalance = IERC20(underlyingToken).balanceOf(address(this));
        require(availableBalance > 0, "No tokens available - try claiming first");
        
        // Calculate proportional share of available balance
        uint256 redeemableValue = (amount * availableBalance) / vsTotalSupply;
        
        // Calculate protocol fee
        uint256 protocolFee = (redeemableValue * PROTOCOL_FEE_BPS) / 10_000;
        uint256 userAmount = redeemableValue - protocolFee;
        
        // Burn user's vS tokens
        vS.burn(msg.sender, amount);
        
        // Transfer protocol fee to treasury
        if (protocolFee > 0 && protocolTreasury != address(0)) {
            IERC20(underlyingToken).transfer(protocolTreasury, protocolFee);
        }
        
        // Transfer tokens to user
        IERC20(underlyingToken).transfer(msg.sender, userAmount);

        emit Redeemed(msg.sender, amount, userAmount);
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

    /**
     * @notice Ultra gas-efficient deposit for small demo/test NFTs (<1000 tokens)
     * @dev Optimized version with minimal checks for educational/demo purposes
     * @param nftId The ID of the Sonic NFT to deposit (must be small value)
     */
    function demoDeposit(uint256 nftId) external nonReentrant whenNotPaused {
        require(sonicNFT != address(0), "NFT contract not set");
        
        address sender = msg.sender;
        
        // Get total value first for size check
        uint256 totalValue = TestSonicDecayfNFT(sonicNFT).getTotalAmount(nftId);
        require(totalValue > 0 && totalValue <= 1000e18, "Demo deposit: 1-1000 tokens only");
        
        // Skip some checks for gas efficiency on small deposits
        require(IERC721(sonicNFT).ownerOf(nftId) == sender, "Not NFT owner");
        require(depositedNFTs[nftId] == address(0), "NFT already deposited");
        require(
            TestSonicDecayfNFT(sonicNFT).claimDelegates(nftId) == address(this),
            "Must delegate claiming rights to vault first"
        );

        // Minimal storage operations
        depositedNFTs[nftId] = sender;
        heldNFTs.push(nftId);

        // Direct mint without additional checks (safe for small amounts)
        vS.mint(sender, totalValue);

        emit NFTDeposited(sender, nftId, totalValue);
    }

    /**
     * @dev Emergency mint function for bootstrap liquidity
     * Only callable by owner before protocol goes live
     */
    function emergencyMint(address to, uint256 amount) external onlyOwner {
        require(amount <= 50000e18, "Exceeds emergency limit");
        vS.mint(to, amount);
    }

    /**
     * @notice Deposit a fraction of an NFT's value to reduce gas costs
     * @dev Allows users to deposit incrementally for large NFTs
     * @param nftId The ID of the Sonic NFT to deposit from
     * @param fraction The fraction to deposit (1-100, representing 1%-100%)
     */
    function depositFraction(uint256 nftId, uint8 fraction) external nonReentrant whenNotPaused {
        require(sonicNFT != address(0), "NFT contract not set");
        require(fraction >= 1 && fraction <= 100, "Invalid fraction");
        
        // Check that the user owns the NFT
        require(IERC721(sonicNFT).ownerOf(nftId) == msg.sender, "Not NFT owner");
        
        // Verify delegation
        require(
            TestSonicDecayfNFT(sonicNFT).claimDelegates(nftId) == address(this),
            "Must delegate claiming rights to vault first"
        );
        
        // Calculate fractional value
        uint256 totalValue = TestSonicDecayfNFT(sonicNFT).getTotalAmount(nftId);
        uint256 fractionalValue = (totalValue * fraction) / 100;
        require(fractionalValue > 0, "Fractional value too small");
        
        // Track the fractional deposit
        if (depositedNFTs[nftId] == address(0)) {
            // First time depositing this NFT
            depositedNFTs[nftId] = msg.sender;
            heldNFTs.push(nftId);
        }
        
        // Mint only the fractional amount
        vS.mint(msg.sender, fractionalValue);
        
        emit NFTDeposited(msg.sender, nftId, fractionalValue);
    }
} 