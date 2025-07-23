// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Vault} from "../src/upgradeable/Vault.sol";

/**
 * @title Pause and Emergency Upgrade Vault
 * @notice Pauses vault, then proposes emergency upgrade with 2-hour delay
 */
contract PauseAndEmergencyUpgrade is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        address vaultProxy = 0x918bF1aA3BcDaB85B348b9D5E10c3ED08d008aBE;

        console.log("=== PAUSE AND EMERGENCY VAULT UPGRADE ===");
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
        console.log("1. Deploying new UpgradeableVault implementation...");
        Vault newImplementation =
            new Vault(tokenAddress, sonicNFT, protocolTreasury, newMaturityTimestamp, newFreezeTimestamp);
        console.log("New implementation deployed at:", address(newImplementation));

        // Step 2: Emergency pause the vault (required for emergency upgrade)
        console.log("2. Emergency pausing vault for emergency upgrade...");
        vault.emergencyPause("Emergency upgrade: Fixing freeze timestamp");
        console.log("Vault emergency paused successfully!");

        // Step 3: Propose emergency upgrade (2-hour delay instead of 12-hour)
        console.log("3. Proposing emergency upgrade...");
        vault.proposeEmergencyUpgrade(
            address(newImplementation), "Emergency fix: Vault frozen, need new timestamps for testing"
        );
        console.log("Emergency upgrade proposed successfully!");

        vm.stopBroadcast();

        // Step 4: Check emergency upgrade proposal details
        console.log("4. Checking emergency upgrade proposal...");
        uint256 executeAfter = vault.getUpgradeProposal(address(newImplementation));
        console.log("Emergency upgrade can be executed after timestamp:", executeAfter);

        uint256 currentTime = block.timestamp;
        uint256 timeRemaining = executeAfter > currentTime ? executeAfter - currentTime : 0;
        console.log("Time remaining until emergency upgrade can be executed:", timeRemaining, "seconds");
        console.log("Time remaining in hours:", timeRemaining / 3600, "hours");
        console.log("Time remaining in minutes:", timeRemaining / 60, "minutes");

        if (timeRemaining > 0) {
            console.log("");
            console.log("=== EMERGENCY UPGRADE PROPOSED SUCCESSFULLY ===");
            console.log("New implementation deployed:", address(newImplementation));
            console.log("Vault paused for emergency upgrade");
            console.log("Emergency upgrade proposed and waiting for 2-hour delay");
            console.log("Execute emergency upgrade after:", executeAfter);
            console.log("");
            console.log("=== NEXT STEPS ===");
            console.log("1. Wait for the emergency upgrade delay period (2 hours)");
            console.log("2. Execute the upgrade");
            console.log("3. Unpause the vault after upgrade");
            console.log("");
            console.log("=== MANUAL EXECUTION COMMANDS ===");
            console.log("After 2 hours, execute these commands:");
            console.log("# Execute upgrade:");
            console.log(
                "cast send %s \"upgradeTo(address)\" %s --rpc-url sonic_testnet --private-key $PRIVATE_KEY",
                vaultProxy,
                address(newImplementation)
            );
            console.log("");
            console.log("# Unpause vault:");
            console.log("cast send %s \"unpause()\" --rpc-url sonic_testnet --private-key $PRIVATE_KEY", vaultProxy);
            console.log("");
            console.log("=== SUCCESS! ===");
            console.log("Emergency upgrade proposed! Only 2 hours to wait instead of 12 hours.");
        } else {
            console.log("");
            console.log("=== EXECUTING EMERGENCY UPGRADE NOW ===");
            vm.startBroadcast(deployerKey);
            vault.upgradeTo(address(newImplementation));
            console.log("Emergency upgrade executed successfully!");

            // Unpause the vault
            console.log("Unpausing vault...");
            vault.unpause();
            console.log("Vault unpaused successfully!");

            vm.stopBroadcast();

            // Verify the upgrade
            console.log("5. Verifying emergency upgrade...");
            Vault upgradedVault = Vault(payable(vaultProxy));
            console.log("New Freeze Timestamp:", upgradedVault.VAULT_FREEZE_TIMESTAMP());
            console.log("New Maturity Timestamp:", upgradedVault.MATURITY_TIMESTAMP());
            console.log("");
            console.log("=== EMERGENCY UPGRADE COMPLETE ===");
            console.log("SUCCESS: Vault emergency upgraded with new timestamps!");
            console.log("SUCCESS: Vault unpaused and ready for deposits!");
        }
    }
}
