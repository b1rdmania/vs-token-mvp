// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {UpgradeableVault} from "../src/upgradeable/UpgradeableVault.sol";

/**
 * @title HarvestAll - Automated Harvest Script for vS Vault
 * @notice Script to harvest all NFTs in batches after maturity
 * @dev Can be run manually or via automation (Chainlink, cron, etc.)
 */
contract HarvestAll is Script {
    
    function run() external {
        // Load vault address from environment or use deployment artifact
        address vaultAddress = vm.envOr("VAULT_ADDRESS", address(0));
        require(vaultAddress != address(0), "VAULT_ADDRESS not set");
        
        UpgradeableVault vault = UpgradeableVault(vaultAddress);
        
        // Check if vault has reached maturity
        require(block.timestamp >= vault.maturityTimestamp(), "Vault not mature yet");
        require(!vault.matured(), "Vault already fully harvested");
        
        console.log("Starting harvest process for vault:", vaultAddress);
        console.log("Block timestamp:", block.timestamp);
        console.log("Maturity timestamp:", vault.maturityTimestamp());
        
        // Get initial state
        (uint256 processedBefore, uint256 total) = vault.getHarvestProgress();
        console.log("Initial progress: %d/%d NFTs processed", processedBefore, total);
        
        uint256 batchSize = vault.MAX_BATCH_SIZE(); // 20 NFTs per batch
        uint256 batchCount = 0;
        uint256 maxBatches = (total + batchSize - 1) / batchSize + 5; // Add buffer for retries
        
        vm.startBroadcast();
        
        // Keep harvesting until all NFTs are processed
        while (!vault.matured() && batchCount < maxBatches) {
            (uint256 startIndex, uint256 remaining) = vault.getNextBatch();
            
            if (remaining == 0) {
                // We've reached the end, but not all are processed (failed NFTs)
                // The contract will wrap around automatically
                console.log("Reached end of array, wrapping around for retries...");
            }
            
            uint256 thisBatch = remaining > 0 ? (remaining < batchSize ? remaining : batchSize) : batchSize;
            
            console.log("Batch %d: Processing %d NFTs starting from index %d", batchCount + 1, thisBatch, startIndex);
            
            try vault.harvestBatch(thisBatch) {
                batchCount++;
                
                // Log progress
                (uint256 processedNow, ) = vault.getHarvestProgress();
                console.log("Progress: %d/%d NFTs processed", processedNow, total);
                
                // Small delay between batches to avoid rate limiting
                if (!vault.matured() && batchCount < maxBatches) {
                    // In a real deployment, you might want to add a delay here
                    // vm.sleep(1); // Not available in Foundry, but useful for real automation
                }
            } catch Error(string memory reason) {
                console.log("Batch failed:", reason);
                break;
            }
        }
        
        vm.stopBroadcast();
        
        // Final status
        if (vault.matured()) {
            console.log("SUCCESS: All NFTs harvested successfully!");
            console.log("Total batches processed:", batchCount);
            
            // Show final vault state
            uint256 vaultBalance = vault.totalAssets();
            uint256 backingRatio = vault.getBackingRatio();
            console.log("Final vault balance:", vaultBalance);
            console.log("Final backing ratio:", backingRatio);
        } else {
            console.log("WARNING: Harvest incomplete after %d batches", batchCount);
            (uint256 processedFinal, uint256 totalFinal) = vault.getHarvestProgress();
            console.log("Final progress: %d/%d NFTs processed", processedFinal, totalFinal);
            
            // Log which NFTs are still unprocessed
            console.log("Checking individual NFT status...");
            for (uint256 i = 0; i < totalFinal; i++) {
                uint256 nftId = vault.getHeldNFT(i);
                bool processed = vault.isProcessed(nftId);
                if (!processed) {
                    console.log("NFT ID %d still unprocessed", nftId);
                }
            }
        }
    }
    
    /**
     * @notice Helper function to estimate gas cost for full harvest
     */
    function estimateHarvestGas() external view {
        address vaultAddress = vm.envOr("VAULT_ADDRESS", address(0));
        require(vaultAddress != address(0), "VAULT_ADDRESS not set");
        
        UpgradeableVault vault = UpgradeableVault(vaultAddress);
        uint256 totalNFTs = vault.getHeldNFTCount();
        uint256 batchSize = vault.MAX_BATCH_SIZE();
        uint256 batchCount = (totalNFTs + batchSize - 1) / batchSize;
        
        // Rough estimate: 150k gas per batch (based on test results)
        uint256 estimatedGas = batchCount * 150_000;
        
        console.log("Harvest gas estimation:");
        console.log("Total NFTs:", totalNFTs);
        console.log("Batches needed:", batchCount);
        console.log("Estimated total gas:", estimatedGas);
        console.log("At 2 gwei: ~$%.6f", (estimatedGas * 2e9 * 34) / 1e20); // Assuming $0.34 S price
    }
} 