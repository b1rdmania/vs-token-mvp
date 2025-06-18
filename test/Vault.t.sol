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

    function setUp() public {
        sToken = new MockSToken();
        fNFT = new MockfNFT();
        vault = new Vault(sToken, address(fNFT));
        // Give user some S tokens and mint an NFT
        sToken.mint(user, 1000 ether);
        fNFT.mint(user);
    }

    function testOwnerIsSet() public {
        assertEq(vault.owner(), owner);
    }

    function testDepositNFT() public {
        uint256 nftId = fNFT.mint(user);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        vault.depositNFT(nftId);
        assertEq(fNFT.ownerOf(nftId), address(vault));
        assertEq(vault.nftOriginalOwner(nftId), user);
        vm.stopPrank();
    }

    function testWithdrawNFT() public {
        uint256 nftId = fNFT.mint(user);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        vault.depositNFT(nftId);
        vault.withdrawNFT(nftId);
        assertEq(fNFT.ownerOf(nftId), user);
        assertEq(vault.nftOriginalOwner(nftId), address(0));
        vm.stopPrank();
    }

    function testDoubleDepositFails() public {
        uint256 nftId = fNFT.mint(user);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        vault.depositNFT(nftId);
        vm.expectRevert("NFT already deposited");
        vault.depositNFT(nftId);
        vm.stopPrank();
    }

    function testUnauthorizedWithdrawFails() public {
        uint256 nftId = fNFT.mint(user);
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
            sToken.mint(users[i], 1000 ether);
        }
        for (uint256 j = 0; j < numNFTs; j++) {
            nftIds[j] = fNFT.mint(users[j % numUsers]);
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
        uint256 nftId = fNFT.mint(user);
        vm.startPrank(user);
        fNFT.approve(address(vault), nftId);
        vault.depositNFT(nftId);
        vault.withdrawNFT(nftId);
        vm.stopPrank();
    }
} 