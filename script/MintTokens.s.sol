// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TestSonicToken} from "../src/MockToken.sol";

contract MintTokens is Script {
    // New tS token address
    address constant TS_TOKEN = 0x567a92ADA6a5D7d31b9e7aa410D868fa91Cd7b7C;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        TestSonicToken tsToken = TestSonicToken(TS_TOKEN);
        
        // Mint 10,000 tS tokens for pool creation
        uint256 mintAmount = 10_000 * 10**18;
        tsToken.mint(deployer, mintAmount);
        
        console.log("Minted", mintAmount / 10**18, "tS tokens to:", deployer);
        console.log("New balance:", tsToken.balanceOf(deployer) / 10**18);

        vm.stopBroadcast();
    }
} 