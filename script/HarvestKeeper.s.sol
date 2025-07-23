// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Vault} from "../src/upgradeable/Vault.sol";

/**
 * @title Harvest Keeper Script (Simplified for Season 1 Only)
 * @notice Automated keeper script for harvesting Season 1 fNFTs
 * @dev Run with: forge script script/HarvestKeeper.s.sol --broadcast
 */
contract HarvestKeeper is Script {
    function run() external {
        address vaultAddress = vm.envAddress("VAULT_ADDRESS");
        uint256 keeperKey = vm.envUint("KEEPER_PRIVATE_KEY");

        console.log("=== HARVEST KEEPER (Season 1 Only) ===");
        console.log("Vault Address:", vaultAddress);
        console.log("Keeper:", vm.addr(keeperKey));
        console.log("Block timestamp:", block.timestamp);
        console.log("");

        Vault vault = Vault(payable(vaultAddress));

        // Check if harvest is needed
        if (block.timestamp < vault.MATURITY_TIMESTAMP()) {
            console.log("[WAIT] Vault not yet matured. Maturity:", vault.MATURITY_TIMESTAMP());
            console.log("[WAIT] Time remaining:", vault.MATURITY_TIMESTAMP() - block.timestamp, "seconds");
            return;
        }

        vm.startBroadcast(keeperKey);

        console.log("1. Attempting Season 1 harvest...");

        try vault.harvest() {
            console.log("[OK] Season 1 harvest completed successfully!");
            console.log("[SUCCESS] Vault is now ready for redemptions");
        } catch Error(string memory reason) {
            if (keccak256(abi.encodePacked(reason)) == keccak256(abi.encodePacked("Already harvested"))) {
                console.log("[INFO] Season 1 already harvested - no action needed");
            } else {
                console.log("[ERROR] Harvest failed:", reason);
                console.log("[RETRY] Will retry on next keeper run");
            }
        } catch {
            console.log("[ERROR] Harvest failed with unknown error");
            console.log("[RETRY] Will retry on next keeper run");
        }

        vm.stopBroadcast();

        // Show vault status
        console.log("");
        console.log("=== VAULT STATUS ===");
        console.log("Total Assets:", vault.totalAssets());
        console.log("Backing Ratio:", vault.getBackingRatio());
        console.log("Is Frozen:", vault.isVaultFrozen());
        console.log("");

        console.log("=== KEEPER SUMMARY ===");
        console.log("[DONE] Keeper run completed");
        console.log("[INFO] Check vault metrics above");
        console.log("[RETRY] Run again if harvest failed");
    }

    /**
     * @notice Check if harvest is needed (view function for monitoring)
     */
    function checkHarvestNeeded() external view returns (bool needed, string memory reason) {
        address vaultAddress = vm.envAddress("VAULT_ADDRESS");
        Vault vault = Vault(payable(vaultAddress));

        if (block.timestamp < vault.MATURITY_TIMESTAMP()) {
            return (false, "Vault not yet matured");
        }

        // For simplified vault, we can't easily check if already harvested
        // without calling the function, so we assume it might be needed
        return (true, "Harvest may be needed - check by calling harvest()");
    }

    /**
     * @notice Get vault timing information
     */
    function getVaultTiming()
        external
        view
        returns (uint256 currentTime, uint256 maturityTime, uint256 freezeTime, bool isMatured, bool isFrozen)
    {
        address vaultAddress = vm.envAddress("VAULT_ADDRESS");
        Vault vault = Vault(payable(vaultAddress));

        currentTime = block.timestamp;
        maturityTime = vault.MATURITY_TIMESTAMP();
        freezeTime = vault.VAULT_FREEZE_TIMESTAMP();
        isMatured = currentTime >= maturityTime;
        isFrozen = vault.isVaultFrozen();
    }
}
