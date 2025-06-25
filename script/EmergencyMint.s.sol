// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {vSVault} from "../src/vSVault.sol";

contract EmergencyMint is Script {
    // Use NEW deployed contract addresses
    address constant VAULT_ADDRESS = 0xa1279bF81E3afE92f9342D97202B72124d740f37;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        vSVault vault = vSVault(VAULT_ADDRESS);
        
        // Mint 1000 D-vS tokens for demo pool creation
        uint256 mintAmount = 1000e18;
        vault.emergencyMint(deployer, mintAmount);
        
        vm.stopBroadcast();
        
        console.log("Emergency minted", mintAmount, "D-vS tokens to", deployer);
    }
} 