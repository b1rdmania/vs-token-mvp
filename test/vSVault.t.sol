// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {vSVault} from "../src/vSVault.sol";
import {VSToken} from "../src/vSToken.sol";
import {TestSonicDecayfNFT} from "../src/DecayfNFT.sol";
import {TestSonicToken} from "../src/MockToken.sol";
import {MockSonicNFT} from "../test/MockSonicNFT.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract VaultTest is Test {
    vSVault public vault;
    VSToken public vsToken;
    TestSonicDecayfNFT public nftContract;
    TestSonicToken public underlyingToken;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    
    uint256 public constant INITIAL_FUNDING = 1_000_000 * 1e18;
    uint256 public constant NFT_AMOUNT = 10_000 * 1e18;
    uint256 public constant VESTING_DURATION = 30 days;
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy contracts
        underlyingToken = new TestSonicToken();
        vsToken = new VSToken();
        nftContract = new TestSonicDecayfNFT(address(underlyingToken));
        vault = new vSVault(address(vsToken), address(underlyingToken));
        
        // Setup vault
        vault.setNFTContract(address(nftContract));
        vsToken.setMinter(address(vault));
        vsToken.transferOwnership(address(vault));
        
        // Fund NFT contract
        underlyingToken.mint(owner, INITIAL_FUNDING);
        underlyingToken.approve(address(nftContract), INITIAL_FUNDING);
        nftContract.fund(INITIAL_FUNDING);
        
        vm.stopPrank();
    }
    
    function testDepositAndMint() public {
        vm.startPrank(owner);
        // Mint NFT to user1
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        vm.stopPrank();
        
        vm.startPrank(user1);
        // Approve and deposit NFT
        nftContract.approve(address(vault), 0);
        vault.deposit(0);
        
        // Check vS tokens minted
        assertEq(vsToken.balanceOf(user1), NFT_AMOUNT);
        assertEq(nftContract.ownerOf(0), address(vault));
        vm.stopPrank();
    }
    
    function testClaimVested() public {
        // Setup: deposit NFT
        vm.startPrank(owner);
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        vm.stopPrank();
        
        vm.startPrank(user1);
        nftContract.approve(address(vault), 0);
        vault.deposit(0);
        vm.stopPrank();
        
        // Fast forward time to allow vesting
        vm.warp(block.timestamp + 15 days); // 50% vested
        
        // Claim vested tokens
        uint256 initialBalance = underlyingToken.balanceOf(address(vault));
        vault.claimVested(0, 1);
        
        uint256 finalBalance = underlyingToken.balanceOf(address(vault));
        assertGt(finalBalance, initialBalance);
    }
    
    function testRedeem() public {
        // Setup: deposit NFT and claim some tokens
        vm.startPrank(owner);
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        vm.stopPrank();
        
        vm.startPrank(user1);
        nftContract.approve(address(vault), 0);
        vault.deposit(0);
        vm.stopPrank();
        
        // Fast forward and claim
        vm.warp(block.timestamp + 15 days);
        vault.claimVested(0, 1);
        
        uint256 vaultBalance = underlyingToken.balanceOf(address(vault));
        uint256 redeemAmount = NFT_AMOUNT / 2;
        
        vm.startPrank(user1);
        uint256 initialUserBalance = underlyingToken.balanceOf(user1);
        vault.redeem(redeemAmount);
        
        uint256 finalUserBalance = underlyingToken.balanceOf(user1);
        assertGt(finalUserBalance, initialUserBalance);
        assertEq(vsToken.balanceOf(user1), NFT_AMOUNT - redeemAmount);
        vm.stopPrank();
    }
    
    function testCannotDepositWithoutNFTContract() public {
        vSVault newVault = new vSVault(address(vsToken), address(underlyingToken));
        
        vm.expectRevert("NFT contract not set");
        newVault.deposit(0);
    }
    
    function testCannotSetNFTContractTwice() public {
        vm.startPrank(owner);
        vm.expectRevert("NFT contract already set");
        vault.setNFTContract(address(nftContract));
        vm.stopPrank();
    }
    
    function testRedeemWithZeroAmount() public {
        vm.expectRevert("Cannot redeem 0");
        vault.redeem(0);
    }
    
    function testKeeperIncentive() public {
        // Setup: deposit NFT
        vm.startPrank(owner);
        nftContract.safeMint(user1, NFT_AMOUNT, VESTING_DURATION);
        vm.stopPrank();
        
        vm.startPrank(user1);
        nftContract.approve(address(vault), 0);
        vault.deposit(0);
        vm.stopPrank();
        
        // Fast forward time
        vm.warp(block.timestamp + 15 days);
        
        // Keeper claims and gets incentive
        vm.startPrank(user2); // user2 as keeper
        uint256 initialKeeperBalance = underlyingToken.balanceOf(user2);
        vault.claimVested(0, 1);
        uint256 finalKeeperBalance = underlyingToken.balanceOf(user2);
        
        // Keeper should receive incentive
        assertGt(finalKeeperBalance, initialKeeperBalance);
        vm.stopPrank();
    }
} 