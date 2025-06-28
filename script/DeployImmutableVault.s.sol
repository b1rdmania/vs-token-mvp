// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ImmutableVault} from "../src/ImmutableVault.sol";
import {ImmutableVSToken} from "../src/ImmutableVSToken.sol";

/**
 * @title Deploy Production Immutable Vault
 * @notice Deploys vS vault for production use with real Sonic contracts
 * @dev Update contract addresses below before deployment
 */
contract DeployImmutableVault is Script {
    // TODO: Update these addresses for production deployment
    address constant SONIC_S_TOKEN = 0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38; // Real S token
    address constant SONIC_FNFT_CONTRACT = 0x0000000000000000000000000000000000000000; // Real fNFT contract
    address constant TREASURY = 0x0000000000000000000000000000000000000000; // Treasury address
    
    // Deployment parameters
    uint256 constant MATURITY_TIMESTAMP = 1743465600; // March 16, 2026 00:00:00 UTC
    uint256 constant FREEZE_TIMESTAMP = 1735689600;   // January 1, 2025 00:00:00 UTC
    
    function run() external {
        require(SONIC_FNFT_CONTRACT != address(0), "Update fNFT contract address");
        require(TREASURY != address(0), "Update treasury address");
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // Calculate vault address
        address vaultAddr = computeCreateAddress(deployer, vm.getNonce(deployer) + 1);
        
        // Deploy vS token
        ImmutableVSToken vsToken = new ImmutableVSToken(vaultAddr, "vS Token", "vS");
        
        // Deploy vault
        ImmutableVault vault = new ImmutableVault(
            address(vsToken),
            SONIC_FNFT_CONTRACT,
            SONIC_S_TOKEN,
            TREASURY,
            MATURITY_TIMESTAMP,
            FREEZE_TIMESTAMP
        );
        
        // Verify address matches
        require(address(vault) == vaultAddr, "Address mismatch");
        
        console.log("=== PRODUCTION DEPLOYMENT ===");
        console.log("Vault:", address(vault));
        console.log("vS Token:", address(vsToken));
        console.log("S Token:", SONIC_S_TOKEN);
        console.log("fNFT Contract:", SONIC_FNFT_CONTRACT);
        console.log("Treasury:", TREASURY);
        console.log("Maturity:", MATURITY_TIMESTAMP);
        console.log("Freeze:", FREEZE_TIMESTAMP);
        
        vm.stopBroadcast();
    }
} 