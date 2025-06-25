// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {TestSonicToken} from "../src/MockToken.sol";
import {TestSonicDecayfNFT} from "../src/DecayfNFT.sol";
import {VSToken} from "../src/VSToken.sol";
import {vSVault} from "../src/vSVault.sol";

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

        // Deploy Vault with deployer as treasury
        address deployer = msg.sender;
        vSVault vault = new vSVault(address(vS), address(tS), deployer);
        console2.log("vSVault deployed at:", address(vault));

        // Set fNFT contract in Vault
        vault.setNFTContract(address(fNFT));

        // Set Vault as minter in vS and transfer ownership
        vS.setMinter(address(vault));
        vS.transferOwnership(address(vault));

        // Fund fNFT contract for vesting payouts
        uint256 fundAmount = 1_000_000 * 1e18;
        tS.mint(deployer, fundAmount);
        tS.approve(address(fNFT), fundAmount);
        fNFT.fund(fundAmount);
        console2.log("Funded fNFT contract with", fundAmount, "tS tokens");

        vm.stopBroadcast();
    }
} 