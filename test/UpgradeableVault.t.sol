// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Test, console} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Vault} from "../src/upgradeable/Vault.sol";
import {VsToken} from "../src/upgradeable/UpgradeableVSToken.sol";
import {MockSonicNFT} from "../src/mocks/MockSonicNFT.sol";

// Mock ERC20 for underlying token
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock S Token", "S") {
        _mint(msg.sender, 1000000e18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/**
 * @title UpgradeableVault Test Suite (Simplified Season 1 Only)
 * @notice Tests for the simplified vault that only handles Season 1 fNFTs
 */
contract UpgradeableVaultTest is Test {
    Vault public vault;
    VsToken public vsToken;
    MockSonicNFT public mockNFT;
    MockERC20 public mockToken;

    // Test constants
    uint256 constant LAUNCH_TIMESTAMP = 1752534000; // July 15, 2025
    uint256 constant FREEZE_TIMESTAMP = 1773532800; // March 15, 2026
    uint256 constant MATURITY_TIMESTAMP = 1776207600; // April 15, 2026

    address constant treasury = 0x0000000000000000000000000000000000001234;
    address constant admin = 0x0000000000000000000000000000000000005678;

    address public user1 = address(0x1111);
    address public user2 = address(0x2222);
    address public user3 = address(0x3333);

    function setUp() public {
        // Deploy mock contracts
        mockToken = new MockERC20();
        mockNFT = new MockSonicNFT();

        // Deploy directly following script pattern (no factory)
        // Step 1: Predict future vault proxy address
        address futureVaultProxy = computeCreateAddress(address(this), vm.getNonce(address(this)) + 3);

        // Step 2: Deploy token implementation with predicted vault as minter
        VsToken tokenImplementation = new VsToken(futureVaultProxy);

        // Step 3: Deploy token proxy
        bytes memory tokenInitData =
            abi.encodeWithSelector(VsToken.initialize.selector, "Test vS Token", "vsTEST", admin);
        ERC1967Proxy tokenProxy = new ERC1967Proxy(address(tokenImplementation), tokenInitData);
        vsToken = VsToken(address(tokenProxy));

        // Step 4: Deploy vault implementation (native S version, no mockToken)
        Vault vaultImplementation =
            new Vault(address(vsToken), address(mockNFT), treasury, MATURITY_TIMESTAMP, FREEZE_TIMESTAMP);

        // Step 5: Deploy vault proxy
        bytes memory vaultInitData = abi.encodeWithSelector(Vault.initialize.selector, admin);
        ERC1967Proxy vaultProxy = new ERC1967Proxy(address(vaultImplementation), vaultInitData);
        vault = Vault(payable(address(vaultProxy)));

        // Verify prediction was correct
        require(address(vault) == futureVaultProxy, "Vault address prediction failed");

        // Set initial timestamp
        vm.warp(LAUNCH_TIMESTAMP);
    }

    // ============ BASIC FUNCTIONALITY TESTS ============

    function testDepositSeason1() public {
        // Mint Season 1 NFT to user1 (1000 S total, 750 S locked)
        mockNFT.mintTestNFT(user1, 1000e18);

        // User1 needs to approve the vault to transfer their NFTs
        vm.prank(user1);
        mockNFT.setApprovalForAll(address(vault), true);

        // Check initial balances
        uint256 userNFTBalance = mockNFT.balanceOf(user1, 1); // Season 1 = token ID 1
        console.log("User NFT balance before deposit:", userNFTBalance);

        vm.prank(user1);
        vault.deposit(); // Simplified deposit - no parameters

        // The vault receives the 75% locked portion (750e18) and takes 1% fee
        uint256 lockedAmount = 1000e18 * 7500 / 10000; // 750e18 (75% locked portion)
        uint256 expectedFeeAmount = (lockedAmount * 100) / 10_000; // 7.5e18 (1% fee)
        uint256 expectedUserAmount = lockedAmount - expectedFeeAmount; // 742.5e18

        assertEq(vsToken.balanceOf(user1), expectedUserAmount, "User vS balance incorrect");
        assertEq(vsToken.balanceOf(treasury), expectedFeeAmount, "Treasury fee incorrect");

        // Check that NFT was transferred to vault
        assertEq(mockNFT.balanceOf(user1, 1), 0, "User should have no NFTs left");
        assertEq(mockNFT.balanceOf(address(vault), 1), lockedAmount, "Vault should have the locked amount");
    }

    function testDepositRequiresApproval() public {
        // Mint Season 1 NFT to user1
        mockNFT.mintTestNFT(user1, 1000e18);

        // Try to deposit without approval - should fail
        vm.prank(user1);
        vm.expectRevert("ERC1155: caller is not token owner or approved");
        vault.deposit();
    }

    function testDepositRequiresNFTs() public {
        // User1 has no NFTs
        vm.prank(user1);
        vm.expectRevert("No Season 1 fNFTs");
        vault.deposit();
    }

    function testDepositAfterFreeze() public {
        // Mint Season 1 NFT to user1
        mockNFT.mintTestNFT(user1, 1000e18);

        vm.prank(user1);
        mockNFT.setApprovalForAll(address(vault), true);

        // Warp to after freeze timestamp
        vm.warp(FREEZE_TIMESTAMP + 1);

        vm.prank(user1);
        vm.expectRevert("Vault frozen");
        vault.deposit();
    }

    function testHarvestBeforeMaturity() public {
        vm.expectRevert("Too early - wait for maturity");
        vault.harvest();
    }

    function testHarvestAfterMaturity() public {
        // First deposit some NFTs
        mockNFT.mintTestNFT(user1, 1000e18);
        vm.prank(user1);
        mockNFT.setApprovalForAll(address(vault), true);
        vm.prank(user1);
        vault.deposit();

        // Simulate native S tokens sent to vault (simulate harvest)
        vm.deal(address(vault), 750e18);

        // Warp to maturity
        vm.warp(MATURITY_TIMESTAMP + 1);

        // Harvest should work
        vault.harvest();

        // Second harvest should fail
        vm.expectRevert("Already harvested");
        vault.harvest();
    }

    function testRedeemAfterHarvest() public {
        // Setup: deposit and harvest
        mockNFT.mintTestNFT(user1, 1000e18);
        vm.prank(user1);
        mockNFT.setApprovalForAll(address(vault), true);
        vm.prank(user1);
        vault.deposit();

        // Simulate native S tokens sent to vault (simulate successful harvest)
        uint256 harvestedAmount = 750e18;
        vm.deal(address(vault), harvestedAmount);

        vm.warp(MATURITY_TIMESTAMP + 1);
        vault.harvest();

        // Now user can redeem
        uint256 userVSBalance = vsToken.balanceOf(user1);
        uint256 expectedSTokens = (userVSBalance * harvestedAmount) / vsToken.totalSupply();
        uint256 expectedFee = (expectedSTokens * 200) / 10_000; // 2% redeem fee
        uint256 expectedUserReceives = expectedSTokens - expectedFee;

        uint256 userBalanceBefore = address(user1).balance;
        uint256 treasuryBalanceBefore = address(treasury).balance;

        vm.prank(user1);
        vault.redeem(userVSBalance);

        assertEq(vsToken.balanceOf(user1), 0, "User should have no vS tokens left");
        assertEq(
            address(user1).balance, userBalanceBefore + expectedUserReceives, "User should receive S tokens minus fee"
        );
        assertEq(address(treasury).balance, treasuryBalanceBefore + expectedFee, "Treasury should receive redeem fee");
    }

    function testImmutableParameters() public view {
        // Verify all parameters are correctly set
        assertEq(address(vault.VS_TOKEN()), address(vsToken));
        assertEq(vault.SONIC_NFT(), address(mockNFT));
        assertEq(vault.PROTOCOL_TREASURY(), treasury);
        assertEq(vault.MATURITY_TIMESTAMP(), MATURITY_TIMESTAMP);
        assertEq(vault.VAULT_FREEZE_TIMESTAMP(), FREEZE_TIMESTAMP);
        assertEq(vault.SEASON_1_ID(), 1);
    }

    function testOnlyAcceptsSeason1NFTs() public {
        // The simplified vault should only accept Season 1 NFTs (token ID 1)
        // This is tested in the onERC1155Received function

        // First test: wrong sender (not the Sonic NFT contract)
        vm.expectRevert("Only accepts Sonic NFTs");
        vault.onERC1155Received(address(this), user1, 1, 100, "");

        // Second test: correct sender but wrong token ID
        vm.prank(address(mockNFT)); // Pretend to be the Sonic NFT contract
        vm.expectRevert("Only accepts Season 1 fNFTs");
        vault.onERC1155Received(address(this), user1, 2, 100, ""); // Season 2 = token ID 2
    }

    function testVaultStatusGetters() public {
        assertEq(vault.isVaultFrozen(), false, "Vault should not be frozen initially");

        // Warp past freeze time
        vm.warp(FREEZE_TIMESTAMP + 1);
        assertEq(vault.isVaultFrozen(), true, "Vault should be frozen after freeze timestamp");

        // Check backing ratio with no deposits
        assertEq(vault.getBackingRatio(), 0, "Empty vault should have 0 backing ratio");

        // Check total assets
        assertEq(vault.totalAssets(), 0, "Empty vault should have 0 total assets");
    }

    function testMultipleDeposits() public {
        // Test multiple users depositing
        mockNFT.mintTestNFT(user1, 1000e18);
        mockNFT.mintTestNFT(user2, 2000e18);

        vm.prank(user1);
        mockNFT.setApprovalForAll(address(vault), true);
        vm.prank(user2);
        mockNFT.setApprovalForAll(address(vault), true);

        vm.prank(user1);
        vault.deposit();

        vm.prank(user2);
        vault.deposit();

        // Check total supply
        uint256 expectedTotal = (750e18 + 1500e18) * 99 / 100; // Both locked amounts minus 1% fee
        assertEq(
            vsToken.totalSupply(),
            expectedTotal + (750e18 + 1500e18) / 100,
            "Total supply should include user tokens and fees"
        );
    }

    function testSweepSurplusAfterGracePeriod() public {
        // Simulate S in vault
        vm.deal(address(vault), 100e18);

        // Warp past grace period
        vm.warp(MATURITY_TIMESTAMP + 180 days + 1);

        uint256 treasuryBefore = address(treasury).balance;

        vault.sweepSurplus();

        assertEq(address(treasury).balance, treasuryBefore + 100e18, "Treasury should receive all surplus");
        assertEq(address(vault).balance, 0, "Vault should be empty after sweep");
    }
}
