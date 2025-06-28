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
    
    address public treasury = address(0x1234);
    address public user1 = address(0x5678);
    address public user2 = address(0x9abc);
    
    uint256 public constant MATURITY_TIMESTAMP = 1000000000;
    uint256 public constant FREEZE_TIMESTAMP = 900000000;
    
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
        
        // Set timestamp before freeze
        vm.warp(800000000);
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
        
        // Check vS tokens minted
        assertEq(vsToken.balanceOf(user1), 1000e18);
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
        
        // Check vS tokens minted and delegation fixed
        assertEq(vsToken.balanceOf(user1), 1000e18);
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
        
        // Total vS minted: 3000e18
        assertEq(vsToken.totalSupply(), 3000e18);
        
        // Make NFT #2 fail on claim
        mockNFT.setShouldRevert(2, true);
        
        // Set claimable amounts for successful NFTs
        mockNFT.setClaimable(1, 1000e18);
        mockNFT.setClaimable(2, 1000e18); // This will fail
        mockNFT.setClaimable(3, 1000e18);
        
        // Advance to maturity
        vm.warp(MATURITY_TIMESTAMP);
        
        // First redemption triggers maturity
        vm.prank(user1);
        vault.redeem(1000e18); // Redeem 1/3 of vS supply
        
        // Check backing ratio: only 2000e18 S claimed out of 3000e18 expected
        uint256 backingRatio = vault.getBackingRatio();
        // Should be approximately 2/3 (0.666... in 18 decimal)
        assertTrue(backingRatio < 1e18); // Less than 100%
        assertTrue(backingRatio > 0.6e18); // Greater than 60%
        
        // Check user received proportional amount
        // User redeemed 1000e18 vS out of 3000e18 total supply
        // Available balance was 2000e18 S
        // User should get approximately 2/3 of their redemption (minus 1% fee)
        uint256 userBalance = mockToken.balanceOf(user1);
        assertTrue(userBalance > 0); // Got something
        assertTrue(userBalance < 1000e18); // Less than full redemption (due to partial claims)
        assertTrue(userBalance > 600e18); // More than 60% (approximately 2/3 minus fees)
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
        
        // Try to claim more than MAX_BATCH_SIZE
        vm.expectRevert("Invalid batch size");
        vault.claimBatch(21);
        
        // Claim maximum allowed batch size
        vault.claimBatch(20);
        
        // Check progress
        (uint256 processed, uint256 total) = vault.getClaimProgress();
        assertEq(processed, 20);
        assertEq(total, 21);
        
        // Claim remaining NFT
        vault.claimBatch(1);
        
        (processed, total) = vault.getClaimProgress();
        assertEq(processed, 21);
        assertEq(total, 21);
    }
    
    function testRedemptionAfterMaturity() public {
        // Setup
        mockNFT.mint(user1, 1, 1000e18);
        vm.prank(user1);
        vault.deposit(1);
        
        // Set claimable
        mockNFT.setClaimable(1, 1000e18);
        
        // Try to redeem before maturity
        vm.prank(user1);
        uint256 redeemAmount = 500e18;
        
        // Should work but not trigger maturity
        assertFalse(vault.matured());
        
        // Advance to maturity
        vm.warp(MATURITY_TIMESTAMP);
        
        // Now redemption should trigger maturity
        vm.prank(user1);
        vault.redeem(redeemAmount);
        
        // Check maturity triggered
        assertTrue(vault.matured());
        
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
        
        // Redeem tiny amount
        vm.prank(user1);
        vault.redeem(1); // 1 wei of vS
        
        // Should work without reverting
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
        
        // Check keeper balance before
        uint256 keeperBalanceBefore = mockToken.balanceOf(user2);
        assertEq(keeperBalanceBefore, 0);
        
        // Keeper calls claimBatch
        vm.prank(user2);
        vault.claimBatch(2);
        
        // Check keeper received incentive
        uint256 keeperBalanceAfter = mockToken.balanceOf(user2);
        uint256 expectedIncentive = (2000e18 * 5) / 10_000; // 0.05% of 2000e18 claimed
        assertEq(keeperBalanceAfter, expectedIncentive);
        assertTrue(expectedIncentive > 0); // Ensure non-zero reward
    }
} 