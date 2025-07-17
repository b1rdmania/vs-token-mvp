// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {UpgradeableVault} from "../src/upgradeable/UpgradeableVault.sol";

/**
 * @title Harvest Keeper Script
 * @notice Automated harvest execution for vS Vault
 * @dev Run this script at maturity to claim all fNFTs
 */
contract HarvestKeeper is Script {
    // Constants
    uint256 constant BATCH_SIZE = 20; // NFTs per batch (gas limit protection)
    uint256 constant MAX_RETRIES = 100; // Maximum harvest attempts

    // Environment variable
    address constant VAULT_ADDRESS = 0x1234567890123456789012345678901234567890; // Set via env

    UpgradeableVault vault;

    function setUp() public {
        vault = UpgradeableVault(VAULT_ADDRESS);
    }

    /**
     * @notice Main harvest function - runs complete harvest cycle
     * @dev Call this script to automatically harvest all NFTs
     */
    function run() public {
        vm.startBroadcast();

        console.log("=== vS Vault Harvest Keeper ===");
        console.log("Vault address:", address(vault));
        console.log("Block timestamp:", block.timestamp);
        console.log("Maturity timestamp:", vault.MATURITY_TIMESTAMP());

        // Check if we can harvest yet
        require(block.timestamp >= vault.MATURITY_TIMESTAMP(), "Too early - wait for maturity");

        // Get initial status
        (uint256 processed, uint256 total) = vault.getHarvestProgress();
        console.log("Initial progress: %d/%d NFTs processed", processed, total);

        if (vault.hasMatured()) {
            console.log("Vault already fully matured!");
            _printFinalStatus();
            vm.stopBroadcast();
            return;
        }

        // Run harvest cycles
        uint256 retries = 0;
        uint256 lastProcessed = processed;

        while (!vault.hasMatured() && retries < MAX_RETRIES) {
            console.log("--- Harvest Cycle %d ---", retries + 1);

            // Try to harvest a batch
            try vault.harvestBatch(BATCH_SIZE) {
                console.log("[OK] Batch harvest successful");
            } catch Error(string memory reason) {
                console.log("[FAIL] Batch harvest failed: %s", reason);
            }

            // Check progress
            (processed, total) = vault.getHarvestProgress();
            console.log("Progress: %d/%d NFTs processed", processed, total);

            // If no progress made, try force delegation
            if (processed == lastProcessed && processed < total) {
                console.log("No progress made, attempting force delegation...");
                _forceDelegateFailedNFTs();
            }

            lastProcessed = processed;
            retries++;

            // Small delay to avoid spamming
            if (!vault.hasMatured()) {
                console.log("Waiting 5 seconds before next attempt...");
                // Note: In real script, you'd add actual delay between transactions
            }
        }

        if (vault.hasMatured()) {
            console.log("HARVEST COMPLETE! Vault fully matured.");
            _printFinalStatus();
        } else {
            console.log("Max retries reached. Manual intervention may be needed.");
            _printFailureAnalysis();
        }

        vm.stopBroadcast();
    }

    /**
     * @notice Force delegation for all held NFTs (recovery function)
     */
    function forceDelegateAll() public {
        vm.startBroadcast();

        console.log("=== Force Delegation Recovery ===");

        uint256 totalNFTs = vault.getHeldNftCount();
        console.log("Total NFTs in vault: %d", totalNFTs);

        // Process in batches of 50 (max allowed)
        for (uint256 i = 0; i < totalNFTs; i += 50) {
            uint256 batchEnd = i + 50 > totalNFTs ? totalNFTs : i + 50;
            uint256 batchSize = batchEnd - i;

            uint256[] memory nftIds = new uint256[](batchSize);
            for (uint256 j = 0; j < batchSize; j++) {
                nftIds[j] = vault.getHeldNft(i + j);
            }

            console.log("Force delegating batch %d-%d...", i, batchEnd - 1);
            try vault.forceDelegate(nftIds) {
                console.log("[OK] Force delegation successful");
            } catch Error(string memory reason) {
                console.log("[FAIL] Force delegation failed: %s", reason);
            }
        }

        vm.stopBroadcast();
    }

    /**
     * @notice Check vault status and print report
     */
    function status() public view {
        console.log("=== vS Vault Status Report ===");
        console.log("Vault address:", address(vault));
        console.log("Current block:", block.number);
        console.log("Current timestamp:", block.timestamp);
        console.log("Maturity timestamp:", vault.MATURITY_TIMESTAMP());
        console.log("Vault frozen:", vault.isVaultFrozen());

        (uint256 processed, uint256 total) = vault.getHarvestProgress();
        console.log("Harvest progress: %d/%d", processed, total);

        console.log("Vault matured:", vault.hasMatured());
        console.log("Backing ratio:", vault.getBackingRatio());
        console.log("Total assets:", vault.totalAssets());

        // Check individual NFT status (first 10)
        console.log("--- Sample NFT Status ---");
        uint256 sampleSize = total > 10 ? 10 : total;
        for (uint256 i = 0; i < sampleSize; i++) {
            uint256 nftId = vault.getHeldNft(i);
            bool isProcessed = vault.isProcessed(nftId);
            console.log("NFT #%d: %s", nftId, isProcessed ? "Processed" : "Pending");
        }
    }

    // ============ INTERNAL HELPERS ============

    function _forceDelegateFailedNFTs() internal {
        uint256 totalNFTs = vault.getHeldNftCount();
        uint256[] memory failedNFTs = new uint256[](totalNFTs);
        uint256 failedCount = 0;

        // Identify failed NFTs
        for (uint256 i = 0; i < totalNFTs; i++) {
            uint256 nftId = vault.getHeldNft(i);
            if (!vault.isProcessed(nftId)) {
                failedNFTs[failedCount] = nftId;
                failedCount++;
            }
        }

        if (failedCount == 0) {
            console.log("No failed NFTs found");
            return;
        }

        // Resize array to actual failed count
        uint256[] memory toDelegate = new uint256[](failedCount > 50 ? 50 : failedCount);
        for (uint256 i = 0; i < toDelegate.length; i++) {
            toDelegate[i] = failedNFTs[i];
        }

        console.log("Force delegating %d failed NFTs...", toDelegate.length);
        try vault.forceDelegate(toDelegate) {
            console.log("[OK] Force delegation successful");
        } catch Error(string memory reason) {
            console.log("[FAIL] Force delegation failed: %s", reason);
        }
    }

    function _printFinalStatus() internal view {
        console.log("=== Final Vault Status ===");
        console.log("Backing ratio: %d (should be 1e18)", vault.getBackingRatio());
        console.log("Total assets: %d", vault.totalAssets());

        (uint256 processed, uint256 total) = vault.getHarvestProgress();
        console.log("Final progress: %d/%d NFTs", processed, total);

        console.log("Users can now redeem vS for S at 1:1 ratio!");
    }

    function _printFailureAnalysis() internal view {
        console.log("=== Failure Analysis ===");

        (uint256 processed, uint256 total) = vault.getHarvestProgress();
        uint256 failed = total - processed;

        console.log("Failed NFTs: %d", failed);
        console.log("Success rate: %d%%", (processed * 100) / total);
        console.log("Current backing ratio: %d", vault.getBackingRatio());

        console.log("Recommended actions:");
        console.log("1. Check Sonic contract for pauses/upgrades");
        console.log("2. Run forceDelegateAll() function");
        console.log("3. Wait for upstream fixes, then retry");
        console.log("4. Users can still redeem pro-rata in the meantime");
    }
}
