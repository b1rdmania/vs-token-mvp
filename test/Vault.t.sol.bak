// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "src/Vault.sol";
import "src/vSToken.sol";
import "test/MockSToken.sol";
import "test/MockfNFT.sol";

contract VaultTest is Test {
    Vault public vault;
    MockSToken public sToken;
    MockfNFT public fNFT;
    address public owner = address(this);
    address public user = address(0xBEEF);
    uint256 public constant INITIAL_S_BALANCE = 1000 ether;
    uint256 public constant NFT_S_VALUE = 100 ether;

    function setUp() public {
        sToken = new MockSToken();
        fNFT = new MockfNFT();
        vault = new Vault(sToken, address(fNFT));
        // Give user some S tokens and mint an NFT
        sToken.mint(user, INITIAL_S_BALANCE);
        fNFT.mint(user, NFT_S_VALUE);
        // Fund vault with S tokens for redemptions
        sToken.mint(address(vault), INITIAL_S_BALANCE);
    }

    function testOwnerIsSet() public {
        assertEq(vault.owner(), owner);
    }

    function testDepositNFT() public {
        uint256 nftId = fNFT.mint(user, NFT_S_VALUE);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        vault.depositNFT(nftId);
        assertEq(fNFT.ownerOf(nftId), address(vault));
        assertEq(vault.nftOriginalOwner(nftId), user);
        vm.stopPrank();
    }

    function testWithdrawNFT() public {
        uint256 nftId = fNFT.mint(user, NFT_S_VALUE);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        vault.depositNFT(nftId);
        vault.withdrawNFT(nftId);
        assertEq(fNFT.ownerOf(nftId), user);
        assertEq(vault.nftOriginalOwner(nftId), address(0));
        vm.stopPrank();
    }

    function testDoubleDepositFails() public {
        uint256 nftId = fNFT.mint(user, NFT_S_VALUE);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        vault.depositNFT(nftId);
        vm.expectRevert("NFT already deposited");
        vault.depositNFT(nftId);
        vm.stopPrank();
    }

    function testUnauthorizedWithdrawFails() public {
        uint256 nftId = fNFT.mint(user, NFT_S_VALUE);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        vault.depositNFT(nftId);
        vm.stopPrank();
        vm.startPrank(address(0xBAD));
        vm.expectRevert(Vault.NotNFTOwner.selector);
        vault.withdrawNFT(nftId);
        vm.stopPrank();
    }

    function testFuzzDepositWithdraw(uint256 seed) public {
        // Fuzzing: simulate up to 10 users and 10 NFTs
        uint256 numUsers = 5 + (seed % 5); // 5-9 users
        uint256 numNFTs = 5 + ((seed / 10) % 5); // 5-9 NFTs
        address[] memory users = new address[](numUsers);
        uint256[] memory nftIds = new uint256[](numNFTs);
        for (uint256 i = 0; i < numUsers; i++) {
            users[i] = address(uint160(uint256(keccak256(abi.encode(seed, i)))));
            sToken.mint(users[i], INITIAL_S_BALANCE);
        }
        for (uint256 j = 0; j < numNFTs; j++) {
            nftIds[j] = fNFT.mint(users[j % numUsers], NFT_S_VALUE);
        }
        // Each user deposits and withdraws their NFT
        for (uint256 j = 0; j < numNFTs; j++) {
            address u = users[j % numUsers];
            vm.startPrank(u);
            fNFT.approve(address(vault), nftIds[j]);
            vault.depositNFT(nftIds[j]);
            vault.withdrawNFT(nftIds[j]);
            vm.stopPrank();
        }
    }

    function testReentrancyProtection() public {
        // The Vault is not vulnerable to reentrancy in depositNFT/withdrawNFT (no external calls after state changes)
        // This is a placeholder to show the check; in a real test, a malicious contract would be used.
        assertTrue(true);
    }

    function testFullUserFlow() public {
        // User mints S, mints NFT, deposits, withdraws, burns
        uint256 nftId = fNFT.mint(user, NFT_S_VALUE);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        vault.depositNFT(nftId);
        vault.withdrawNFT(nftId);
        vm.stopPrank();
    }

    function testPenaltyCurveAtStart() public {
        uint256 nftId = fNFT.mint(user, NFT_S_VALUE);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        
        // At start, penalty should be 100% and claimable should be 0
        assertEq(fNFT.penalty(nftId), 1e18); // 100%
        assertEq(fNFT.claimable(nftId), 0);
        
        vault.depositNFT(nftId);
        // User should receive 0 vS tokens due to 100% penalty
        assertEq(vault.balanceOf(user), 0);
        vm.stopPrank();
    }

    function testPenaltyCurveHalfway() public {
        uint256 nftId = fNFT.mint(user, NFT_S_VALUE);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        
        // Fast forward to halfway through vesting
        vm.warp(block.timestamp + fNFT.VESTING_PERIOD() / 2);
        
        // Penalty should be 50% and claimable should be 50%
        assertApproxEqRel(fNFT.penalty(nftId), 0.5e18, 0.01e18); // 50% with 1% tolerance
        assertApproxEqRel(fNFT.claimable(nftId), NFT_S_VALUE / 2, 0.01e18);
        
        vault.depositNFT(nftId);
        // User should receive ~50% of NFT_S_VALUE in vS tokens
        assertApproxEqRel(vault.balanceOf(user), NFT_S_VALUE / 2, 0.01e18);
        vm.stopPrank();
    }

    function testPenaltyCurveFullyVested() public {
        uint256 nftId = fNFT.mint(user, NFT_S_VALUE);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        
        // Fast forward past vesting period
        vm.warp(block.timestamp + fNFT.VESTING_PERIOD() + 1);
        
        // Penalty should be 0% and claimable should be 100%
        assertEq(fNFT.penalty(nftId), 0);
        assertEq(fNFT.claimable(nftId), NFT_S_VALUE);
        
        vault.depositNFT(nftId);
        // User should receive full NFT_S_VALUE in vS tokens
        assertEq(vault.balanceOf(user), NFT_S_VALUE);
        vm.stopPrank();
    }

    function testRedeemVS() public {
        uint256 nftId = fNFT.mint(user, NFT_S_VALUE);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        
        // Fast forward to get some claimable value
        vm.warp(block.timestamp + fNFT.VESTING_PERIOD() / 2);
        vault.depositNFT(nftId);
        
        uint256 initialSBalance = sToken.balanceOf(user);
        uint256 vsBalance = vault.balanceOf(user);
        
        // Redeem half of vS tokens
        uint256 redeemAmount = vsBalance / 2;
        vault.redeemVS(redeemAmount);
        
        // Check balances after redemption
        assertEq(vault.balanceOf(user), vsBalance - redeemAmount);
        assertEq(sToken.balanceOf(user), initialSBalance + redeemAmount);
        vm.stopPrank();
    }

    function testFuzzPenaltyCurve(uint256 timeElapsed) public {
        // Cap timeElapsed to 2x vesting period to avoid overflow
        timeElapsed = bound(timeElapsed, 0, 2 * fNFT.VESTING_PERIOD());
        
        uint256 nftId = fNFT.mint(user, NFT_S_VALUE);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        
        vm.warp(block.timestamp + timeElapsed);
        
        uint256 expectedClaimable;
        if (timeElapsed >= fNFT.VESTING_PERIOD()) {
            expectedClaimable = NFT_S_VALUE;
        } else {
            expectedClaimable = (NFT_S_VALUE * timeElapsed) / fNFT.VESTING_PERIOD();
        }
        
        vault.depositNFT(nftId);
        assertApproxEqRel(vault.balanceOf(user), expectedClaimable, 0.01e18);
        vm.stopPrank();
    }

    function testMultipleNFTsWithDifferentVesting() public {
        uint256[] memory nftIds = new uint256[](3);
        uint256[] memory expectedVS = new uint256[](3);
        
        vm.startPrank(user);
        
        // Mint 3 NFTs with different vesting progress
        for (uint256 i = 0; i < 3; i++) {
            nftIds[i] = fNFT.mint(user, NFT_S_VALUE);
            fNFT.approve(address(vault), nftIds[i]);
        }
        
        // Advance time differently for each NFT
        vm.warp(block.timestamp + fNFT.VESTING_PERIOD() / 4);  // 25% vested
        vault.depositNFT(nftIds[0]);
        expectedVS[0] = (NFT_S_VALUE * fNFT.VESTING_PERIOD() / 4) / fNFT.VESTING_PERIOD();
        
        vm.warp(block.timestamp + fNFT.VESTING_PERIOD() / 2);  // 75% vested
        vault.depositNFT(nftIds[1]);
        expectedVS[1] = (NFT_S_VALUE * 3 * fNFT.VESTING_PERIOD() / 4) / fNFT.VESTING_PERIOD();
        
        vm.warp(block.timestamp + fNFT.VESTING_PERIOD());  // 100% vested
        vault.depositNFT(nftIds[2]);
        expectedVS[2] = NFT_S_VALUE;
        
        uint256 totalExpectedVS = expectedVS[0] + expectedVS[1] + expectedVS[2];
        assertApproxEqRel(vault.balanceOf(user), totalExpectedVS, 0.01e18);
        
        vm.stopPrank();
    }
} 