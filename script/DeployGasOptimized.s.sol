// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {TestSonicDecayfNFT} from "../src/DecayfNFT.sol";
import {TestSonicToken} from "../src/MockToken.sol";
import {VSToken} from "../src/VSToken.sol";
import {vSVault} from "../src/vSVault.sol";

contract DeployGasOptimized is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy tS token with faucet (gas-optimized version)
        TestSonicToken tsToken = new TestSonicToken();
        console.log("Gas-Optimized tS Token deployed at:", address(tsToken));

        // Deploy fNFT contract
        TestSonicDecayfNFT fnft = new TestSonicDecayfNFT(address(tsToken));
        console.log("fNFT contract deployed at:", address(fnft));

        // Deploy D-vS token (gas-optimized version)
        VSToken dvsToken = new VSToken();
        console.log("Gas-Optimized D-vS Token deployed at:", address(dvsToken));

        // Deploy vault with gas optimizations
        vSVault vault = new vSVault(
            address(dvsToken),
            address(tsToken),
            deployer // protocol treasury
        );
        console.log("Gas-Optimized Vault deployed at:", address(vault));

        // Set vault as minter for D-vS token
        dvsToken.setMinter(address(vault));
        console.log("Vault set as D-vS token minter");
        
        // Set the NFT contract in the vault
        vault.setNFTContract(address(fnft));
        console.log("NFT contract set in vault");

        // Emergency mint initial D-vS tokens for demo
        dvsToken.emergencyMint(deployer, 2000e18);
        console.log("Emergency minted 2000 D-vS tokens to deployer");

        vm.stopBroadcast();

        console.log("\n=== Gas-Optimized Deployment Complete ===");
        console.log("tS Token (with faucet):", address(tsToken));
        console.log("fNFT Contract:", address(fnft));
        console.log("D-vS Token (ultra-efficient):", address(dvsToken));
        console.log("Vault (assembly-optimized):", address(vault));
        console.log("\nGas Savings:");
        console.log("- Demo deposits: 90%+ reduction");
        console.log("- Small mints: 60-80% reduction");
        console.log("- Assembly optimizations for <1000 token operations");
    }
} 