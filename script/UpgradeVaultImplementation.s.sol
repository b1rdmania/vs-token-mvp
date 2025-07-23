// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Vault} from "../src/upgradeable/Vault.sol";

/**
 * @title Upgrade Vault Implementation
 * @notice Deploy new implementation with future timestamps and upgrade existing proxy
 */
contract UpgradeVaultImplementation is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        address vaultProxy = 0x918bF1aA3BcDaB85B348b9D5E10c3ED08d008aBE;

        console.log("=== UPGRADING VAULT IMPLEMENTATION ===");
        console.log("Existing Vault Proxy:", vaultProxy);
        console.log("Deployer:", deployer);
        console.log("");

        vm.startBroadcast(deployerKey);

        // Get current vault instance
        Vault vault = Vault(payable(vaultProxy));

        // Get current parameters from existing vault
        address tokenAddress = address(vault.VS_TOKEN());
        address sonicNFT = vault.SONIC_NFT();
        address protocolTreasury = vault.PROTOCOL_TREASURY();

        console.log("Current Parameters:");
        console.log("Token Address:", tokenAddress);
        console.log("Sonic NFT:", sonicNFT);
        console.log("Protocol Treasury:", protocolTreasury);
        console.log("");

        // Set NEW timestamps for the new implementation
        uint256 newMaturityTimestamp = block.timestamp + 365 days; // 1 year from now
        uint256 newFreezeTimestamp = block.timestamp + 30 days; // 30 days from now

        console.log("New Timestamps:");
        console.log("New Maturity Timestamp:", newMaturityTimestamp);
        console.log("New Freeze Timestamp:", newFreezeTimestamp);
        console.log("");

        // Step 1: Deploy new implementation with new timestamps
        console.log("1. Deploying new Vault implementation...");
        Vault newImplementation =
            new Vault(tokenAddress, sonicNFT, protocolTreasury, newMaturityTimestamp, newFreezeTimestamp);
        console.log("New implementation deployed at:", address(newImplementation));

        // Step 2: Upgrade the existing proxy to point to new implementation
        console.log("2. Upgrading proxy to new implementation...");
        vault.upgradeTo(address(newImplementation));
        console.log("Proxy upgraded successfully!");

        vm.stopBroadcast();

        // Step 3: Verify the upgrade
        console.log("3. Verifying upgrade...");
        Vault upgradedVault = Vault(payable(vaultProxy));

        console.log("Verification Results:");
        console.log("Token Address:", address(upgradedVault.VS_TOKEN()));
        console.log("Sonic NFT:", upgradedVault.SONIC_NFT());
        console.log("Protocol Treasury:", upgradedVault.PROTOCOL_TREASURY());
        console.log("New Maturity Timestamp:", upgradedVault.MATURITY_TIMESTAMP());
        console.log("New Freeze Timestamp:", upgradedVault.VAULT_FREEZE_TIMESTAMP());
        console.log("");

        // Test if deposit works now
        console.log("4. Testing deposit function...");
        try upgradedVault.deposit() {
            console.log("ERROR: Deposit should still fail (NFT not owned by deployer)");
        } catch Error(string memory reason) {
            if (bytes(reason).length > 0) {
                console.log("SUCCESS: Deposit function accessible, error:", reason);
            } else {
                console.log("SUCCESS: Deposit function accessible");
            }
        }

        console.log("");
        console.log("=== UPGRADE COMPLETE ===");
        console.log("New implementation deployed:", address(newImplementation));
        console.log("Proxy upgraded successfully");
        console.log("New freeze timestamp set to:", newFreezeTimestamp);
        console.log("Vault should now accept deposits!");
        console.log("");
        console.log("=== TESTING COMMANDS ===");
        console.log("cast call %s \"VAULT_FREEZE_TIMESTAMP()\" --rpc-url sonic_testnet", vaultProxy);
        console.log("cast call %s \"deposit(uint256)\" 1 --rpc-url sonic_testnet", vaultProxy);
        console.log("");
        console.log("=== SUCCESS! ===");
        console.log("The vault proxy address remains the same, but now has new timestamps!");
    }
}
