// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {TestSonicToken} from "../src/MockToken.sol";
import {TestSonicDecayfNFT} from "../src/DecayfNFT.sol";
import {VSToken} from "../src/VSToken.sol";
import {TestVault} from "../src/Vault.sol";

contract DeployDemo is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Deploy Test Sonic token (tS)
        TestSonicToken tS = new TestSonicToken();
        console2.log("TestSonicToken (tS) deployed at:", address(tS));

        // Deploy Test Sonic Vesting NFT (tS-fNFT)
        TestSonicDecayfNFT fNFT = new TestSonicDecayfNFT(address(tS));
        console2.log("TestSonicDecayfNFT (tS-fNFT) deployed at:", address(fNFT));

        // Deploy Test vS token (tvS)
        VSToken vS = new VSToken();
        console2.log("VSToken (tvS) deployed at:", address(vS));

        // Deploy Vault
        TestVault vault = new TestVault(address(tS));
        console2.log("TestVault deployed at:", address(vault));

        // Set fNFT and vS addresses in Vault
        vault.setFNFT(address(fNFT));
        vault.setVSToken(address(vS));

        // Set Vault as minter in vS
        vS.setMinter(address(vault));

        // Fund Vault with tS tokens for redemptions
        uint256 fundAmount = 1_000_000 * 1e18;
        tS.mint(address(vault), fundAmount);
        console2.log("Funded Vault with", fundAmount, "tS tokens");

        vm.stopBroadcast();
    }
} 