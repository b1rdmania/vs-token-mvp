// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Vault} from "../src/upgradeable/Vault.sol";

/**
 * @title Harvest All Script (Simplified for Season 1 Only)
 * @notice Harvests Season 1 fNFTs after maturity
 * @dev Run with: forge script script/HarvestAll.s.sol --broadcast
 */
contract HarvestAll is Script {
    function run() external {
        address vaultAddress = vm.envAddress("VAULT_ADDRESS");
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        console.log("=== HARVEST ALL SEASON 1 FNFTS ===");
        console.log("Vault Address:", vaultAddress);
        console.log("Deployer:", vm.addr(deployerKey));
        console.log("");

        Vault vault = Vault(payable(vaultAddress));

        // Check if vault has matured
        require(block.timestamp >= vault.MATURITY_TIMESTAMP(), "Vault not yet matured");

        vm.startBroadcast(deployerKey);

        console.log("1. Checking harvest status...");

        // Check if already harvested by trying to read vault state
        // (simplified vault doesn't have getHarvestProgress)
        bool alreadyHarvested;
        try vault.harvest() {
            console.log("[OK] Season 1 harvest completed successfully!");
            alreadyHarvested = false;
        } catch Error(string memory reason) {
            if (keccak256(abi.encodePacked(reason)) == keccak256(abi.encodePacked("Already harvested"))) {
                console.log("[INFO] Season 1 already harvested");
                alreadyHarvested = true;
            } else {
                console.log("[ERROR] Harvest failed:", reason);
                revert(reason);
            }
        } catch {
            console.log("[ERROR] Harvest failed with unknown error");
            revert("Harvest failed");
        }

        vm.stopBroadcast();

        // Print final status
        console.log("");
        console.log("=== HARVEST SUMMARY ===");
        if (alreadyHarvested) {
            console.log("Status: Already completed");
        } else {
            console.log("Status: Successfully harvested Season 1");
        }
        console.log("Vault can now be used for redemptions");
        console.log("");

        console.log("=== NEXT STEPS ===");
        console.log("- Users can now redeem vS tokens for S tokens");
        console.log("- Check vault balance: cast call", vaultAddress, "\"totalAssets()\"");
        console.log("- Check backing ratio: cast call", vaultAddress, "\"getBackingRatio()\"");
    }
}
