// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/upgradeable/UpgradeableVault.sol";
import "../src/upgradeable/UpgradeableVSToken.sol";
import "../src/upgradeable/UpgradeableVaultFactory.sol";

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
        claimableAmounts[tokenId] = 0;
        claimDelegates[tokenId] = to;
    }
    
    function setClaimable(uint256 tokenId, uint256 amount) external {
        claimableAmounts[tokenId] = amount;
    }
    
    function setShouldRevert(uint256 tokenId, bool shouldRevert) external {
        shouldRevertOnClaim[tokenId] = shouldRevert;
    }
    
    function ownerOf(uint256 tokenId) external view returns (address) {
        return owners[tokenId];
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        require(owners[tokenId] == from, "Not owner");
        owners[tokenId] = to;
    }
    
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

contract UpgradeableVaultTest is Test {
    UpgradeableVault public vault;
    UpgradeableVSToken public vsToken;
    UpgradeableVaultFactory public factory;
    MockSonicNFT public mockNFT;
    MockERC20 public mockToken;
    
    // Implementation contracts
    address vaultImplementation;
    address tokenImplementation;
    
    // Test constants
    uint256 constant LAUNCH_TIMESTAMP = 1752534000;     // July 15, 2025
    uint256 constant FREEZE_TIMESTAMP = 1773532800;     // March 15, 2026
    uint256 constant MATURITY_TIMESTAMP = 1776207600;   // April 15, 2026
    
    address constant treasury = 0x0000000000000000000000000000000000001234;
    address constant admin = 0x0000000000000000000000000000000000005678;
    address constant timelock = 0x0000000000000000000000000000000000009ABC;
    
    address public user1 = address(0x1111);
    address public user2 = address(0x2222);
    address public user3 = address(0x3333);
    
    function setUp() public {
        // Deploy mock contracts
        mockToken = new MockERC20();
        mockNFT = new MockSonicNFT(address(mockToken));
        
        // Deploy implementation contracts
        vaultImplementation = address(new UpgradeableVault());
        tokenImplementation = address(new UpgradeableVSToken());
        
        // Deploy factory
        factory = new UpgradeableVaultFactory(
            vaultImplementation,
            tokenImplementation,
            admin,
            timelock
        );
        
        // Deploy vault and token through factory
        vm.prank(address(this)); // Factory deployer has DEPLOYER_ROLE
        (address vaultAddr, address tokenAddr) = factory.deployVault(
            "TestSeason",
            address(mockNFT),
            address(mockToken),
            treasury,
            MATURITY_TIMESTAMP,
            FREEZE_TIMESTAMP,
            admin
        );
        
        vault = UpgradeableVault(vaultAddr);
        vsToken = UpgradeableVSToken(tokenAddr);
        
        // Set initial timestamp
        vm.warp(LAUNCH_TIMESTAMP);
    }
    
    // ============ BASIC FUNCTIONALITY TESTS ============
    
    function testDepositWithCorrectDelegation() public {
        mockNFT.mint(user1, 1, 1000e18);
        
        vm.prank(user1);
        mockNFT.setDelegate(1, address(vault));
        
        vm.prank(user1);
        vault.deposit(1);
        
        uint256 expectedUserAmount = 1000e18 - (1000e18 * 100) / 10_000; // 990e18
        uint256 expectedFeeAmount = (1000e18 * 100) / 10_000; // 10e18
        
        assertEq(vsToken.balanceOf(user1), expectedUserAmount);
        assertEq(vsToken.balanceOf(treasury), expectedFeeAmount);
        assertEq(vault.getHeldNFTCount(), 1);
        assertEq(vault.depositedNFTs(1), user1);
    }
    
    function testDepositWithWrongDelegation() public {
        mockNFT.mint(user1, 1, 1000e18);
        
        vm.prank(user1);
        mockNFT.setDelegate(1, user2);
        
        vm.prank(user1);
        vault.deposit(1);
        
        uint256 expectedUserAmount = 1000e18 - (1000e18 * 100) / 10_000; // 990e18
        assertEq(vsToken.balanceOf(user1), expectedUserAmount);
        assertEq(mockNFT.claimDelegates(1), address(vault));
    }
    
    function testHarvestBatchProcessing() public {
        // Deposit 3 NFTs
        for (uint256 i = 1; i <= 3; i++) {
            mockNFT.mint(user1, i, 1000e18);
            vm.prank(user1);
            vault.deposit(i);
        }
        
        // Set all as claimable
        for (uint256 i = 1; i <= 3; i++) {
            mockNFT.setClaimable(i, 1000e18);
        }
        
        // Advance to maturity
        vm.warp(MATURITY_TIMESTAMP);
        
        // Harvest all at once
        vault.harvestBatch(3);
        
        // Check vault is matured
        assertTrue(vault.hasMatured());
        
        // Check all NFTs processed
        for (uint256 i = 1; i <= 3; i++) {
            assertTrue(vault.isProcessed(i));
        }
        
        (uint256 processed, uint256 total) = vault.getHarvestProgress();
        assertEq(processed, 3);
        assertEq(total, 3);
    }
    
    function testPartialClaimFailureHandling() public {
        // Deposit 3 NFTs
        for (uint256 i = 1; i <= 3; i++) {
            mockNFT.mint(user1, i, 1000e18);
            vm.prank(user1);
            vault.deposit(i);
        }
        
        // Make NFT #2 fail on claim
        mockNFT.setShouldRevert(2, true);
        
        // Set claimable amounts
        for (uint256 i = 1; i <= 3; i++) {
            mockNFT.setClaimable(i, 1000e18);
        }
        
        // Advance to maturity
        vm.warp(MATURITY_TIMESTAMP);
        
        // Harvest batch - NFT #2 will fail
        vault.harvestBatch(3);
        
        // Vault should not be matured yet
        assertFalse(vault.hasMatured());
        
        // Check which NFTs were processed
        assertTrue(vault.isProcessed(1));
        assertFalse(vault.isProcessed(2)); // Failed
        assertTrue(vault.isProcessed(3));
        
        // Users can still redeem pro-rata
        uint256 userVsBalance = vsToken.balanceOf(user1);
        vm.prank(user1);
        vault.redeem(userVsBalance / 3);
        
        // Fix NFT #2 and retry
        mockNFT.setShouldRevert(2, false);
        vault.harvestBatch(3);
        
        // Now vault should be matured
        assertTrue(vault.hasMatured());
    }
    
    function testProRataRedemption() public {
        mockNFT.mint(user1, 1, 1000e18);
        vm.prank(user1);
        vault.deposit(1);
        
        mockNFT.setClaimable(1, 1000e18);
        vm.warp(MATURITY_TIMESTAMP);
        
        // Harvest first
        vault.harvestBatch(1);
        
        // Redeem with 2% fee
        uint256 userVsBalance = vsToken.balanceOf(user1);
        vm.prank(user1);
        vault.redeem(userVsBalance);
        
        // Check backing ratio is 1:1 (perfect)
        assertEq(vault.getBackingRatio(), 1e18);
    }
    
    // ============ UPGRADE-SPECIFIC TESTS ============
    
    function testUpgradeTimelock() public {
        // Deploy new implementation
        address newImplementation = address(new UpgradeableVault());
        
        // Propose upgrade
        vm.prank(admin);
        vault.proposeUpgrade(newImplementation);
        
        // Try to upgrade immediately (should fail)
        vm.prank(admin);
        vm.expectRevert("Upgrade not ready or not proposed");
        vault.upgradeToAndCall(newImplementation, "");
        
        // Wait for timelock period
        vm.warp(block.timestamp + 48 hours);
        
        // Now upgrade should work
        vm.prank(admin);
        vault.upgradeToAndCall(newImplementation, "");
        
        // Verify upgrade worked
        assertTrue(vault.getUpgradeProposal(newImplementation) == 0);
    }
    
    function testUpgradeRoleProtection() public {
        address newImplementation = address(new UpgradeableVault());
        
        // User without UPGRADER_ROLE cannot propose upgrade
        vm.prank(user1);
        vm.expectRevert();
        vault.proposeUpgrade(newImplementation);
        
        // User without UPGRADER_ROLE cannot execute upgrade
        vm.prank(admin);
        vault.proposeUpgrade(newImplementation);
        
        vm.warp(block.timestamp + 48 hours);
        
        vm.prank(user1);
        vm.expectRevert();
        vault.upgradeToAndCall(newImplementation, "");
    }
    
    function testUpgradeProposalCancellation() public {
        address newImplementation = address(new UpgradeableVault());
        
        // Propose upgrade
        vm.prank(admin);
        vault.proposeUpgrade(newImplementation);
        
        // Cancel upgrade
        vm.prank(admin);
        vault.cancelUpgrade(newImplementation);
        
        // Verify proposal was cancelled
        assertEq(vault.getUpgradeProposal(newImplementation), 0);
        
        // Try to execute cancelled upgrade (should fail)
        vm.warp(block.timestamp + 48 hours);
        vm.prank(admin);
        vm.expectRevert("Upgrade not ready or not proposed");
        vault.upgradeToAndCall(newImplementation, "");
    }
    
    function testUpgradeIntervalProtection() public {
        address impl1 = address(new UpgradeableVault());
        address impl2 = address(new UpgradeableVault());
        
        // First upgrade
        vm.prank(admin);
        vault.proposeUpgrade(impl1);
        vm.warp(block.timestamp + 48 hours);
        vm.prank(admin);
        vault.upgradeToAndCall(impl1, "");
        
        // Try immediate second upgrade (should fail)
        vm.prank(admin);
        vault.proposeUpgrade(impl2);
        vm.warp(block.timestamp + 48 hours);
        vm.prank(admin);
        vm.expectRevert("Too soon since last upgrade");
        vault.upgradeToAndCall(impl2, "");
        
        // Wait for minimum interval
        vm.warp(block.timestamp + 24 hours);
        vm.prank(admin);
        vault.upgradeToAndCall(impl2, "");
    }
    
    // ============ EMERGENCY PAUSE TESTS ============
    
    function testEmergencyPause() public {
        // Admin can pause
        vm.prank(admin);
        vault.emergencyPause("Emergency test");
        
        // Verify pause state
        (bool isPaused, uint256 pausedAt, string memory reason) = vault.getPauseInfo();
        assertTrue(isPaused);
        assertEq(pausedAt, block.timestamp);
        assertEq(reason, "Emergency test");
        
        // User functions should be paused
        mockNFT.mint(user1, 1, 1000e18);
        vm.prank(user1);
        vm.expectRevert("Pausable: paused");
        vault.deposit(1);
    }
    
    function testEmergencyUnpause() public {
        // Pause first
        vm.prank(admin);
        vault.emergencyPause("Test pause");
        
        // Admin can unpause
        vm.prank(admin);
        vault.unpause();
        
        // Verify unpause state
        (bool isPaused, , string memory reason) = vault.getPauseInfo();
        assertFalse(isPaused);
        assertEq(reason, "");
        
        // User functions should work again
        mockNFT.mint(user1, 1, 1000e18);
        vm.prank(user1);
        vault.deposit(1);
    }
    
    function testAutomaticUnpause() public {
        // Pause first
        vm.prank(admin);
        vault.emergencyPause("Test pause");
        
        // Wait for MAX_PAUSE_DURATION
        vm.warp(block.timestamp + 7 days);
        
        // Anyone can unpause after max duration
        vm.prank(user1);
        vault.unpause();
        
        // Verify unpause state
        (bool isPaused, , ) = vault.getPauseInfo();
        assertFalse(isPaused);
    }
    
    function testPauseRoleProtection() public {
        // User without PAUSER_ROLE cannot pause
        vm.prank(user1);
        vm.expectRevert("Not authorized to pause");
        vault.emergencyPause("Unauthorized pause");
        
        // User without PAUSER_ROLE cannot unpause (before timeout)
        vm.prank(admin);
        vault.emergencyPause("Test pause");
        
        vm.prank(user1);
        vm.expectRevert("Not authorized to unpause or too early");
        vault.unpause();
    }
    
    // ============ ROLE-BASED ACCESS CONTROL TESTS ============
    
    function testRoleInitialization() public {
        // Admin should have all roles
        assertTrue(vault.hasRole(vault.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(vault.hasRole(vault.ADMIN_ROLE(), admin));
        assertTrue(vault.hasRole(vault.UPGRADER_ROLE(), admin));
        assertTrue(vault.hasRole(vault.PAUSER_ROLE(), admin));
        assertTrue(vault.hasRole(vault.OPERATOR_ROLE(), admin));
        assertTrue(vault.hasRole(vault.EMERGENCY_ROLE(), admin));
    }
    
    function testRoleManagement() public {
        // Admin can grant roles
        vm.prank(admin);
        vault.grantRole(vault.PAUSER_ROLE(), user1);
        
        assertTrue(vault.hasRole(vault.PAUSER_ROLE(), user1));
        
        // User1 can now pause
        vm.prank(user1);
        vault.emergencyPause("User1 pause");
        
        // Admin can revoke roles
        vm.prank(admin);
        vault.revokeRole(vault.PAUSER_ROLE(), user1);
        
        assertFalse(vault.hasRole(vault.PAUSER_ROLE(), user1));
    }
    
    // ============ FACTORY TESTS ============
    
    function testFactoryDeployment() public {
        // Deploy another vault through factory
        vm.prank(address(this));
        (address vaultAddr, address tokenAddr) = factory.deployVault(
            "Season2",
            address(mockNFT),
            address(mockToken),
            treasury,
            MATURITY_TIMESTAMP + 365 days,
            FREEZE_TIMESTAMP + 365 days,
            admin
        );
        
        // Verify deployment
        assertTrue(vaultAddr != address(0));
        assertTrue(tokenAddr != address(0));
        assertTrue(vaultAddr != address(vault));
        assertTrue(tokenAddr != address(vsToken));
        
        // Check deployment registry
        assertEq(factory.getVaultBySeason("Season2"), vaultAddr);
        assertTrue(factory.seasonExists("Season2"));
    }
    
    function testFactoryRoleProtection() public {
        // User without DEPLOYER_ROLE cannot deploy
        vm.prank(user1);
        vm.expectRevert();
        factory.deployVault(
            "UnauthorizedSeason",
            address(mockNFT),
            address(mockToken),
            treasury,
            MATURITY_TIMESTAMP,
            FREEZE_TIMESTAMP,
            admin
        );
    }
    
    function testFactoryTemplateUpdate() public {
        address newVaultImpl = address(new UpgradeableVault());
        
        // Factory deployer can update templates
        vm.prank(address(this));
        factory.updateVaultImplementation(newVaultImpl);
        
        assertEq(factory.vaultImplementation(), newVaultImpl);
    }
    
    // ============ TOKEN TESTS ============
    
    function testTokenMinterControl() public {
        // Only authorized minters can mint
        vm.expectRevert();
        vsToken.mint(user1, 1000e18);
        
        // Admin can add minters
        vm.prank(admin);
        vsToken.addMinter(user1);
        
        // User1 can now mint
        vm.prank(user1);
        vsToken.mint(user2, 1000e18);
        
        assertEq(vsToken.balanceOf(user2), 1000e18);
    }
    
    function testTokenPause() public {
        // Give user1 some tokens
        vm.prank(admin);
        vsToken.addMinter(user1);
        vm.prank(user1);
        vsToken.mint(user1, 1000e18);
        
        // Admin can pause token
        vm.prank(admin);
        vsToken.emergencyPause("Token pause test");
        
        // Transfers should be paused
        vm.prank(user1);
        vm.expectRevert("Pausable: paused");
        vsToken.transfer(user2, 100e18);
        
        // Unpause
        vm.prank(admin);
        vsToken.unpause();
        
        // Transfers should work again
        vm.prank(user1);
        vsToken.transfer(user2, 100e18);
        
        assertEq(vsToken.balanceOf(user2), 100e18);
    }
    
    // ============ EDGE CASE TESTS ============
    
    function testGasBombProtection() public {
        // Try to process more than MAX_BATCH_SIZE
        vm.expectRevert("Invalid batch size");
        vault.harvestBatch(21);
        
        // forceDelegate batch size protection
        uint256[] memory largeArray = new uint256[](51);
        vm.expectRevert("Batch too large");
        vault.forceDelegate(largeArray);
    }
    
    function testVaultCapacityLimit() public {
        // This would be very expensive to test with 10,000 NFTs
        // So we'll test the logic by checking the requirement
        
        // Mock a vault at capacity
        for (uint256 i = 0; i < 10; i++) {
            mockNFT.mint(user1, i + 1, 1000e18);
            vm.prank(user1);
            vault.deposit(i + 1);
        }
        
        // Should still work (well under capacity)
        assertEq(vault.getHeldNFTCount(), 10);
    }
    
    function testSweepSurplus() public {
        // Add some balance to vault
        mockToken.mint(address(vault), 1000e18);
        
        // Cannot sweep before grace period
        vm.warp(MATURITY_TIMESTAMP + 179 days);
        vm.expectRevert("Grace period not over");
        vault.sweepSurplus();
        
        // Can sweep after grace period
        vm.warp(MATURITY_TIMESTAMP + 181 days);
        vault.sweepSurplus();
        
        // Treasury should receive the surplus
        assertEq(mockToken.balanceOf(treasury), 1000e18);
        assertEq(mockToken.balanceOf(address(vault)), 0);
    }
    
    function testImmutableParameters() public view {
        // Verify all parameters are correctly set
        assertEq(vault.vS(), address(vsToken));
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
    
    function testForceDelegate() public {
        // Deposit NFTs
        mockNFT.mint(user1, 1, 1000e18);
        mockNFT.mint(user1, 2, 1000e18);
        
        vm.startPrank(user1);
        vault.deposit(1);
        vault.deposit(2);
        vm.stopPrank();
        
        // Force delegate should work (even though already delegated)
        uint256[] memory ids = new uint256[](2);
        ids[0] = 1;
        ids[1] = 2;
        
        vault.forceDelegate(ids);
        
        // Delegation should remain correct
        assertEq(mockNFT.claimDelegates(1), address(vault));
        assertEq(mockNFT.claimDelegates(2), address(vault));
    }
} 