// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ImmutableVault} from "../src/ImmutableVault.sol";
import {ImmutableVSToken} from "../src/ImmutableVSToken.sol";
import {TestSonicDecayfNFT} from "../src/DecayfNFT.sol";
import {TestSonicToken} from "../src/MockToken.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract ImmutableVaultTest is Test {
    ImmutableVault public vault;
    ImmutableVSToken public vsToken;
    TestSonicDecayfNFT public nftContract;
    TestSonicToken public underlyingToken;
    
    address public treasury = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    
    uint256 public constant INITIAL_FUNDING = 1_000_000 * 1e18;
    uint256 public constant NFT_AMOUNT = 10_000 * 1e18;
    uint256 public constant VESTING_DURATION = 270 days; // 9 months
    
    uint256 public maturityTimestamp;
    uint256 public freezeTimestamp;
    
    function setUp() public {
        // Deploy tokens first
        underlyingToken = new TestSonicToken();
        
        // Set timestamps
        freezeTimestamp = block.timestamp + 30 days; // 1 month deposit window
        maturityTimestamp = block.timestamp + VESTING_DURATION; // 9 months maturity
        
        // Deploy vS token (needs vault address, so we calculate it)
        address predictedVault = computeCreateAddress(address(this), vm.getNonce(address(this)) + 2);
        vsToken = new ImmutableVSToken(predictedVault, "vS Token", "vS");
        
        // Deploy NFT contract
        nftContract = new TestSonicDecayfNFT(address(underlyingToken));
        
        // Deploy vault
        vault = new ImmutableVault(
            address(vsToken),
            address(nftContract),
            address(underlyingToken),
            treasury,
            maturityTimestamp,
            freezeTimestamp
        );
        
        // Fund NFT contract
        underlyingToken.mint(address(this), INITIAL_FUNDING);
        underlyingToken.approve(address(nftContract), INITIAL_FUNDING);
        nftContract.fund(INITIAL_FUNDING);
    }
    
    function testDeposit() public {
        // Mint NFT to user1
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        
        vm.startPrank(user1);
        // Delegate claiming rights to vault
        nftContract.setClaimDelegate(0, address(vault));
        
        // Deposit NFT
        vault.deposit(0);
        
        // Check vS tokens minted 1:1
        assertEq(vsToken.balanceOf(user1), NFT_AMOUNT);
        
        // Check vault tracks deposit
        assertEq(vault.depositedNFTs(0), user1);
        assertEq(vault.getHeldNFTCount(), 1);
        assertEq(vault.getHeldNFT(0), 0);
        
        vm.stopPrank();
    }
    
    function testClaimBatch() public {
        // Setup: deposit NFT
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        
        vm.startPrank(user1);
        nftContract.setClaimDelegate(0, address(vault));
        vault.deposit(0);
        vm.stopPrank();
        
        // Fast forward to allow some vesting
        vm.warp(block.timestamp + 135 days); // 50% vested
        
        // Anyone can call claimBatch
        uint256 initialBalance = underlyingToken.balanceOf(address(vault));
        vault.claimBatch(1);
        
        uint256 finalBalance = underlyingToken.balanceOf(address(vault));
        assertGt(finalBalance, initialBalance);
    }
    
    function testKeeperIncentive() public {
        // Setup: deposit NFT
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        
        vm.startPrank(user1);
        nftContract.setClaimDelegate(0, address(vault));
        vault.deposit(0);
        vm.stopPrank();
        
        // Fast forward
        vm.warp(block.timestamp + 135 days);
        
        // Keeper claims and gets 0.05% incentive
        vm.startPrank(user2);
        uint256 initialKeeperBalance = underlyingToken.balanceOf(user2);
        vault.claimBatch(1);
        uint256 finalKeeperBalance = underlyingToken.balanceOf(user2);
        
        assertGt(finalKeeperBalance, initialKeeperBalance);
        vm.stopPrank();
    }
    
    function testRedeemBeforeMaturity() public {
        // Setup: deposit and claim some tokens
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        
        vm.startPrank(user1);
        nftContract.setClaimDelegate(0, address(vault));
        vault.deposit(0);
        vm.stopPrank();
        
        // Fast forward and claim
        vm.warp(block.timestamp + 135 days);
        vault.claimBatch(1);
        
        // Redeem before maturity (proportional)
        uint256 redeemAmount = NFT_AMOUNT / 2;
        
        vm.startPrank(user1);
        uint256 initialBalance = underlyingToken.balanceOf(user1);
        vault.redeem(redeemAmount);
        
        uint256 finalBalance = underlyingToken.balanceOf(user1);
        assertGt(finalBalance, initialBalance);
        assertEq(vsToken.balanceOf(user1), NFT_AMOUNT - redeemAmount);
        vm.stopPrank();
    }
    
    function testRedeemAtMaturity() public {
        // Setup: deposit NFT
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        
        vm.startPrank(user1);
        nftContract.setClaimDelegate(0, address(vault));
        vault.deposit(0);
        vm.stopPrank();
        
        // Fast forward to maturity
        vm.warp(maturityTimestamp + 1);
        
        // First redemption triggers maturity
        vm.startPrank(user1);
        uint256 initialBalance = underlyingToken.balanceOf(user1);
        vault.redeem(NFT_AMOUNT);
        
        uint256 finalBalance = underlyingToken.balanceOf(user1);
        
        // Should get close to 1:1 (minus 1% protocol fee)
        uint256 expectedAmount = (NFT_AMOUNT * 99) / 100; // 99% after 1% fee
        assertApproxEqRel(finalBalance - initialBalance, expectedAmount, 0.05e18); // 5% tolerance
        
        vm.stopPrank();
    }
    
    function testProtocolFee() public {
        // Setup and redeem
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        
        vm.startPrank(user1);
        nftContract.setClaimDelegate(0, address(vault));
        vault.deposit(0);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 135 days);
        vault.claimBatch(1);
        
        uint256 initialTreasuryBalance = underlyingToken.balanceOf(treasury);
        
        vm.startPrank(user1);
        vault.redeem(NFT_AMOUNT / 2);
        vm.stopPrank();
        
        uint256 finalTreasuryBalance = underlyingToken.balanceOf(treasury);
        assertGt(finalTreasuryBalance, initialTreasuryBalance);
    }
    
    function testSweepSurplus() public {
        // Setup: deposit and reach maturity
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        
        vm.startPrank(user1);
        nftContract.setClaimDelegate(0, address(vault));
        vault.deposit(0);
        vm.stopPrank();
        
        // Fast forward to maturity and trigger it
        vm.warp(maturityTimestamp + 1);
        
        // Trigger maturity by trying to redeem (creates surplus)
        vm.startPrank(user1);
        vault.redeem(NFT_AMOUNT / 2); // Only redeem half, leaving surplus
        vm.stopPrank();
        
        // Fast forward past grace period
        vm.warp(maturityTimestamp + 180 days + 1);
        
        // Anyone can sweep
        uint256 initialTreasuryBalance = underlyingToken.balanceOf(treasury);
        vault.sweepSurplus();
        
        uint256 finalTreasuryBalance = underlyingToken.balanceOf(treasury);
        assertGt(finalTreasuryBalance, initialTreasuryBalance);
    }
    
    function testCannotDepositAfterFreeze() public {
        // Fast forward past freeze
        vm.warp(freezeTimestamp + 1);
        
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        
        vm.startPrank(user1);
        nftContract.setClaimDelegate(0, address(vault));
        
        vm.expectRevert("Vault frozen - use new season vault");
        vault.deposit(0);
        
        vm.stopPrank();
    }
    
    function testCannotSweepBeforeGrace() public {
        vm.expectRevert("Grace period not over");
        vault.sweepSurplus();
    }
    
    function testViewFunctions() public {
        assertFalse(vault.hasMatured());
        assertEq(vault.totalAssets(), 0);
        assertEq(vault.getHeldNFTCount(), 0);
        assertFalse(vault.isVaultFrozen());
        
        // After freeze
        vm.warp(freezeTimestamp + 1);
        assertTrue(vault.isVaultFrozen());
        
        // After maturity
        vm.warp(maturityTimestamp + 1);
        assertTrue(vault.hasMatured());
    }
} 