// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ImmutableVault.sol";
import "../src/ImmutableVSToken.sol";

// Mock contracts for testing
contract MockSonicNFT {
    mapping(uint256 => address) public owners;
    mapping(uint256 => uint256) public totalAmounts;
    mapping(uint256 => uint256) public claimableAmounts;
    mapping(uint256 => address) public claimDelegates;
    mapping(uint256 => bool) public shouldRevertOnClaim;
    
    address public underlyingToken;
    
    constructor(address _underlyingToken) {
        underlyingToken = _underlyingToken;
    }
    
    function mint(address to, uint256 tokenId, uint256 totalAmount) external {
        owners[tokenId] = to;
        totalAmounts[tokenId] = totalAmount;
        claimableAmounts[tokenId] = 0; // Starts with 0 claimable
        claimDelegates[tokenId] = to; // Initially delegated to owner
    }
    
    function setClaimable(uint256 tokenId, uint256 amount) external {
        claimableAmounts[tokenId] = amount;
    }
    
    function setShouldRevert(uint256 tokenId, bool shouldRevert) external {
        shouldRevertOnClaim[tokenId] = shouldRevert;
    }
    
    // ERC721 functions
    function ownerOf(uint256 tokenId) external view returns (address) {
        return owners[tokenId];
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        require(owners[tokenId] == from, "Not owner");
        owners[tokenId] = to;
    }
    
    // fNFT specific functions
    function getTotalAmount(uint256 tokenId) external view returns (uint256) {
        return totalAmounts[tokenId];
    }
    
    function claimable(uint256 tokenId) external view returns (uint256) {
        return claimableAmounts[tokenId];
    }
    
    function claimVestedTokens(uint256 tokenId) external returns (uint256) {
        require(!shouldRevertOnClaim[tokenId], "Mock: claim reverted");
        uint256 amount = claimableAmounts[tokenId];
        claimableAmounts[tokenId] = 0;
        
        // Transfer tokens to caller (should be vault)
        MockERC20(underlyingToken).mint(msg.sender, amount);
        return amount;
    }
    
    function setDelegate(uint256 tokenId, address delegate) external {
        require(owners[tokenId] == msg.sender, "Not owner");
        claimDelegates[tokenId] = delegate;
    }
}

contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract MockVSToken {
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;
    address public vault;
    
    function setVault(address _vault) external {
        vault = _vault;
    }
    
    function mint(address to, uint256 amount) external {
        require(msg.sender == vault, "Only vault can mint");
        balanceOf[to] += amount;
        totalSupply += amount;
    }
    
    function burn(address from, uint256 amount) external {
        require(msg.sender == vault, "Only vault can burn");
        require(balanceOf[from] >= amount, "Insufficient balance");
        balanceOf[from] -= amount;
        totalSupply -= amount;
    }
}

contract ImmutableVaultTest is Test {
    ImmutableVault public vault;
    MockVSToken public vsToken;
    MockSonicNFT public mockNFT;
    MockERC20 public mockToken;
    
    // Test constants (based on July 15, 2025 launch)
    uint256 constant LAUNCH_TIMESTAMP = 1752534000;     // July 15, 2025 00:00:00 UTC
    uint256 constant FREEZE_TIMESTAMP = 1773532800;     // March 15, 2026 00:00:00 UTC (freeze deposits)
    uint256 constant MATURITY_TIMESTAMP = 1776207600;   // April 15, 2026 00:00:00 UTC (274 days after launch)
    
    address constant treasury = 0x0000000000000000000000000000000000001234;
    
    address public user1 = address(0x5678);
    address public user2 = address(0x9abc);
    
    function setUp() public {
        // Deploy mock contracts
        mockToken = new MockERC20();
        mockNFT = new MockSonicNFT(address(mockToken));
        
        // Deploy mock vS token
        vsToken = new MockVSToken();
        
        // Deploy vault
        vault = new ImmutableVault(
            address(vsToken),
            address(mockNFT),
            address(mockToken),
            treasury,
            MATURITY_TIMESTAMP,
            FREEZE_TIMESTAMP
        );
        
        // Set vault as minter for mock vS token
        vsToken.setVault(address(vault));
        
        // Set initial timestamp to launch date
        vm.warp(LAUNCH_TIMESTAMP);
    }
    
    function testDepositWithCorrectDelegation() public {
        // Mint NFT to user1
        mockNFT.mint(user1, 1, 1000e18);
        
        // User delegates to vault before deposit
        vm.prank(user1);
        mockNFT.setDelegate(1, address(vault));
        
        // User deposits NFT
        vm.prank(user1);
        vault.deposit(1);
        
        // Check vS tokens minted (1% fee to treasury, 99% to user)
        uint256 expectedUserAmount = 1000e18 - (1000e18 * 100) / 10_000; // 990e18
        uint256 expectedFeeAmount = (1000e18 * 100) / 10_000; // 10e18
        
        assertEq(vsToken.balanceOf(user1), expectedUserAmount);
        assertEq(vsToken.balanceOf(treasury), expectedFeeAmount);
        assertEq(vault.getHeldNFTCount(), 1);
        assertEq(vault.depositedNFTs(1), user1);
    }
    
    function testDepositWithWrongDelegation() public {
        // Mint NFT to user1
        mockNFT.mint(user1, 1, 1000e18);
        
        // User delegates to someone else (not vault)
        vm.prank(user1);
        mockNFT.setDelegate(1, user2);
        
        // User deposits NFT - should still work due to self-delegation
        vm.prank(user1);
        vault.deposit(1);
        
        // Check vS tokens minted and delegation fixed (with 1% fee)
        uint256 expectedUserAmount = 1000e18 - (1000e18 * 100) / 10_000; // 990e18
        assertEq(vsToken.balanceOf(user1), expectedUserAmount);
        assertEq(mockNFT.claimDelegates(1), address(vault));
    }
    
    function testCannotRevokeDelegationAfterDeposit() public {
        // Mint NFT to user1
        mockNFT.mint(user1, 1, 1000e18);
        
        // User deposits NFT
        vm.prank(user1);
        vault.deposit(1);
        
        // Verify vault owns NFT and delegation is set
        assertEq(mockNFT.ownerOf(1), address(vault));
        assertEq(mockNFT.claimDelegates(1), address(vault));
        
        // User tries to revoke delegation - should fail (vault is owner now)
        vm.prank(user1);
        vm.expectRevert("Not owner");
        mockNFT.setDelegate(1, user1);
        
        // Delegation should remain with vault
        assertEq(mockNFT.claimDelegates(1), address(vault));
    }
    
    function testPartialClaimFailureProportionalRedemption() public {
        // Setup: Deposit 3 NFTs, make 1 fail to claim
        mockNFT.mint(user1, 1, 1000e18);
        mockNFT.mint(user1, 2, 1000e18);
        mockNFT.mint(user1, 3, 1000e18);
        
        vm.startPrank(user1);
        vault.deposit(1);
        vault.deposit(2);
        vault.deposit(3);
        vm.stopPrank();
        
        // Total vS minted: 3000e18 - 3% mint fees = 2970e18 to user + 30e18 to treasury
        uint256 totalMintFees = (3000e18 * 100) / 10_000; // 30e18
        uint256 userVsBalance = 3000e18 - totalMintFees; // 2970e18
        assertEq(vsToken.totalSupply(), 3000e18); // Total supply includes fees
        assertEq(vsToken.balanceOf(user1), userVsBalance);
        assertEq(vsToken.balanceOf(treasury), totalMintFees);
        
        // Make NFT #2 fail on claim
        mockNFT.setShouldRevert(2, true);
        
        // Set claimable amounts for all NFTs
        mockNFT.setClaimable(1, 1000e18);
        mockNFT.setClaimable(2, 1000e18); // This will fail
        mockNFT.setClaimable(3, 1000e18);
        
        // Advance to maturity
        vm.warp(MATURITY_TIMESTAMP);
        
        // Harvest batch - NFT #2 will fail but others succeed
        vault.harvestBatch(3);
        
        // Vault should not be matured yet (NFT #2 failed)
        assertFalse(vault.matured());
        
        // Check harvest progress: 2 processed, 3 total
        (uint256 processedCount, uint256 total) = vault.getHarvestProgress();
        assertEq(processedCount, 2);
        assertEq(total, 3);
        
        // Check individual NFT processing status
        assertTrue(vault.isProcessed(1));
        assertFalse(vault.isProcessed(2)); // Failed
        assertTrue(vault.isProcessed(3));
        
        // Users can redeem pro-rata even with failed NFT
        // Vault balance: 2000e18, Total supply: 3000e18
        // Backing ratio: ~66.67%
        vm.prank(user1);
        vault.redeem(990e18); // Redeem 1/3 of user's vS balance
        
        // Check user received proportional amount
        // Expected: (990e18 * 2000e18) / 3000e18 = 660e18 gross
        // Minus 2% redeem fee = ~646.8e18
        uint256 userBalance = mockToken.balanceOf(user1);
        assertTrue(userBalance > 645e18 && userBalance < 650e18);
        
        // Fix NFT #2 and retry harvest
        mockNFT.setShouldRevert(2, false);
        vault.harvestBatch(3); // Will process the failed NFT #2
        
        // Now vault should be matured with over-backing due to pro-rata redemption
        assertTrue(vault.matured());
        
        // Expected backing ratio calculation:
        // After redemption: 2010e18 total supply, 1340e18 vault balance
        // After final harvest: 2010e18 total supply, 2340e18 vault balance  
        // Backing ratio: 2340e18 / 2010e18 = 1.164179... (116.4%)
        uint256 backingRatio = vault.getBackingRatio();
        assertTrue(backingRatio > 1.16e18 && backingRatio < 1.17e18); // ~116.4%
        
        // This over-backing is correct behavior - early redeemers got pro-rata value
        // and remaining vS tokens become more valuable as harvest completes
    }
    
    function testForceDelegateHelper() public {
        // Mint NFTs
        mockNFT.mint(user1, 1, 1000e18);
        mockNFT.mint(user1, 2, 1000e18);
        
        // Deposit NFTs
        vm.startPrank(user1);
        vault.deposit(1);
        vault.deposit(2);
        vm.stopPrank();
        
        // Verify delegation is correct after deposit
        assertEq(mockNFT.claimDelegates(1), address(vault));
        assertEq(mockNFT.claimDelegates(2), address(vault));
        
        // Test that forceDelegate can be called by anyone (even if not needed)
        uint256[] memory ids = new uint256[](2);
        ids[0] = 1;
        ids[1] = 2;
        
        vm.prank(user2); // Even user2 can call it (permissionless)
        vault.forceDelegate(ids);
        
        // Delegation should remain correct
        assertEq(mockNFT.claimDelegates(1), address(vault));
        assertEq(mockNFT.claimDelegates(2), address(vault));
    }
    
    function testGasBombProtection() public {
        // Deposit maximum batch size + 1 NFTs
        for (uint256 i = 1; i <= 21; i++) {
            mockNFT.mint(user1, i, 100e18);
            vm.prank(user1);
            vault.deposit(i);
        }
        
        // Set all as claimable
        for (uint256 i = 1; i <= 21; i++) {
            mockNFT.setClaimable(i, 100e18);
        }
        
        // Advance to maturity
        vm.warp(MATURITY_TIMESTAMP);
        
        // Try to harvest more than MAX_BATCH_SIZE
        vm.expectRevert("Invalid batch size");
        vault.harvestBatch(21);
        
        // Harvest maximum allowed batch size
        vault.harvestBatch(20);
        
        // Check progress
        (uint256 processed, uint256 total) = vault.getHarvestProgress();
        assertEq(processed, 20);
        assertEq(total, 21);
        
        // Harvest remaining NFT
        vault.harvestBatch(1);
        
        (processed, total) = vault.getHarvestProgress();
        assertEq(processed, 21);
        assertEq(total, 21);
        
        // Vault should now be matured
        assertTrue(vault.matured());
    }
    
    function testRedemptionAfterMaturity() public {
        // Setup
        mockNFT.mint(user1, 1, 1000e18);
        vm.prank(user1);
        vault.deposit(1);
        
        // Set claimable
        mockNFT.setClaimable(1, 1000e18);
        
        // Advance to maturity
        vm.warp(MATURITY_TIMESTAMP);
        
        // Try to redeem before any harvest (should fail due to no balance)
        vm.prank(user1);
        uint256 redeemAmount = 500e18;
        vm.expectRevert("No tokens available for redemption");
        vault.redeem(redeemAmount);
        
        // Harvest first to create balance
        vault.harvestBatch(1);
        assertTrue(vault.matured());
        
        // Now redemption should work with full backing
        vm.prank(user1);
        vault.redeem(redeemAmount);
        
        // Check backing ratio is 1:1 (perfect)
        assertEq(vault.getBackingRatio(), 1e18);
    }
    
    function testSweepSurplus() public {
        // Setup vault with some balance
        mockToken.mint(address(vault), 1000e18);
        
        // Try sweep before grace period
        vm.warp(MATURITY_TIMESTAMP + 179 days);
        vm.expectRevert("Grace period not over");
        vault.sweepSurplus();
        
        // Advance past grace period
        vm.warp(MATURITY_TIMESTAMP + 181 days);
        
        // Anyone can sweep
        vm.prank(user2);
        vault.sweepSurplus();
        
        // Check treasury received funds
        assertEq(mockToken.balanceOf(treasury), 1000e18);
        assertEq(mockToken.balanceOf(address(vault)), 0);
    }
    
    function testImmutableParameters() public view {
        // Verify all immutable parameters are set correctly
        assertEq(address(vault.vS()), address(vsToken));
        assertEq(vault.sonicNFT(), address(mockNFT));
        assertEq(vault.underlyingToken(), address(mockToken));
        assertEq(vault.protocolTreasury(), treasury);
        assertEq(vault.maturityTimestamp(), MATURITY_TIMESTAMP);
        assertEq(vault.vaultFreezeTimestamp(), FREEZE_TIMESTAMP);
    }
    
    function testCannotDepositAfterFreeze() public {
        mockNFT.mint(user1, 1, 1000e18);
        
        // Advance past freeze timestamp
        vm.warp(FREEZE_TIMESTAMP + 1);
        
        vm.prank(user1);
        vm.expectRevert("Vault frozen - use new season vault");
        vault.deposit(1);
    }
    
    function testRoundingInRedemption() public {
        // Test edge case with very small redemptions
        mockNFT.mint(user1, 1, 1000e18);
        vm.prank(user1);
        vault.deposit(1);
        
        mockNFT.setClaimable(1, 1000e18);
        vm.warp(MATURITY_TIMESTAMP);
        
        // Harvest first
        vault.harvestBatch(1);
        
        // Redeem tiny amount
        vm.prank(user1);
        vault.redeem(1); // 1 wei of vS
        
        // Should work without reverting
        assertTrue(vault.matured());
    }
    
    function testHarvestBeforeMaturity() public {
        // Setup: Deposit NFTs and make them claimable
        mockNFT.mint(user1, 1, 1000e18);
        mockNFT.mint(user1, 2, 1000e18);
        
        vm.startPrank(user1);
        vault.deposit(1);
        vault.deposit(2);
        vm.stopPrank();
        
        // Set claimable amounts
        mockNFT.setClaimable(1, 1000e18);
        mockNFT.setClaimable(2, 1000e18);
        
        // Try to harvest before maturity
        vm.expectRevert("Too early - wait for maturity");
        vault.harvestBatch(2);
        
        // Advance to maturity
        vm.warp(MATURITY_TIMESTAMP);
        
        // Now harvest should work
        vault.harvestBatch(2);
        assertTrue(vault.matured());
    }
    
    function testKeeperIncentivePayment() public {
        // Setup: Deposit NFTs and make them claimable
        mockNFT.mint(user1, 1, 1000e18);
        mockNFT.mint(user1, 2, 1000e18);
        
        vm.startPrank(user1);
        vault.deposit(1);
        vault.deposit(2);
        vm.stopPrank();
        
        // Set claimable amounts
        mockNFT.setClaimable(1, 1000e18);
        mockNFT.setClaimable(2, 1000e18);
        
        // Advance to maturity
        vm.warp(MATURITY_TIMESTAMP);
        
        // Check keeper balance before
        uint256 keeperBalanceBefore = mockToken.balanceOf(user2);
        assertEq(keeperBalanceBefore, 0);
        
        // Keeper calls harvestBatch (no incentive in self-keeper mode)
        vm.prank(user2);
        vault.harvestBatch(2);
        
        // Check keeper received no incentive (KEEPER_INCENTIVE_BPS = 0)
        uint256 keeperBalanceAfter = mockToken.balanceOf(user2);
        assertEq(keeperBalanceAfter, 0); // No reward in self-keeper mode
        
        // Vault should be matured
        assertTrue(vault.matured());
    }
    
    function testMintAndRedeemFees() public {
        // Test comprehensive fee structure: 1% mint + 2% redeem
        uint256 nftValue = 1000e18;
        mockNFT.mint(user1, 1, nftValue);
        
        // Deposit NFT (1% mint fee)
        vm.prank(user1);
        vault.deposit(1);
        
        uint256 mintFee = (nftValue * 100) / 10_000; // 10e18
        uint256 userVsAmount = nftValue - mintFee; // 990e18
        
        // Verify mint fee went to treasury
        assertEq(vsToken.balanceOf(treasury), mintFee);
        assertEq(vsToken.balanceOf(user1), userVsAmount);
        
        // Make NFT claimable and advance to maturity
        mockNFT.setClaimable(1, nftValue);
        vm.warp(MATURITY_TIMESTAMP);
        
        // Harvest first
        vault.harvestBatch(1);
        assertTrue(vault.matured());
        
        // Record treasury balance before redemption
        uint256 treasuryBalanceBefore = mockToken.balanceOf(treasury);
        
        // Redeem all vS tokens (2% redeem fee)
        vm.prank(user1);
        vault.redeem(userVsAmount);
        
        // Calculate expected redemption: proportional share minus 2% fee
        uint256 totalVsSupply = userVsAmount + mintFee; // 1000e18 total
        uint256 vaultBalance = nftValue; // 1000e18 claimed
        uint256 proportionalShare = (userVsAmount * vaultBalance) / totalVsSupply; // 990e18
        uint256 redeemFee = (proportionalShare * 200) / 10_000; // ~19.8e18 (2%)
        uint256 expectedUserReceived = proportionalShare - redeemFee; // ~970.2e18
        
        // Verify user received correct amount after redeem fee
        assertEq(mockToken.balanceOf(user1), expectedUserReceived);
        
        // Verify redeem fee went to treasury
        uint256 treasuryBalanceAfter = mockToken.balanceOf(treasury);
        assertEq(treasuryBalanceAfter - treasuryBalanceBefore, redeemFee);
    }
    
    function testProRataRedemptionPreventsHostageAttack() public {
        // Setup: Deposit 3 NFTs, make 1 permanently fail
        mockNFT.mint(user1, 1, 1000e18);
        mockNFT.mint(user1, 2, 1000e18);
        mockNFT.mint(user1, 3, 1000e18);
        
        vm.startPrank(user1);
        vault.deposit(1);
        vault.deposit(2);
        vault.deposit(3);
        vm.stopPrank();
        
        // Make NFT #2 permanently fail (simulating hostage NFT)
        mockNFT.setShouldRevert(2, true);
        
        // Set claimable amounts for all NFTs
        mockNFT.setClaimable(1, 1000e18);
        mockNFT.setClaimable(2, 1000e18); // This will fail permanently
        mockNFT.setClaimable(3, 1000e18);
        
        // Advance to maturity
        vm.warp(MATURITY_TIMESTAMP);
        
        // Harvest partial batch - NFT #2 will fail but others succeed
        vault.harvestBatch(3);
        
        // Vault balance should be 2000e18 (2 out of 3 NFTs claimed)
        uint256 vaultBalance = vault.totalAssets();
        assertEq(vaultBalance, 2000e18);
        
        // Check backing ratio: 2000e18 / 3000e18 = 66.67%
        uint256 backingRatio = vault.getBackingRatio();
        assertTrue(backingRatio > 0.666e18 && backingRatio < 0.667e18);
        
        // Users can still redeem pro-rata despite failed NFT #2
        uint256 userVsBalance = vsToken.balanceOf(user1); // 2970e18
        
        // Redeem half of user's vS tokens
        vm.prank(user1);
        vault.redeem(userVsBalance / 2);
        
        // User should receive proportional amount based on current backing
        uint256 userBalance = mockToken.balanceOf(user1);
        
        // Expected: (1485e18 * 2000e18) / 3000e18 = 990e18 gross
        // Minus 2% redeem fee = ~970e18
        assertTrue(userBalance > 965e18 && userBalance < 975e18);
        
        // Vault is still functional despite permanent NFT failure
        // No "hostage NFT" blocking all redemptions
    }
} 