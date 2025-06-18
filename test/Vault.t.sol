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
} 