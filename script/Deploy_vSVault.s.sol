// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {vSVault} from "../src/vSVault.sol";
import {vSToken} from "../src/vSToken.sol";
import {MockSonicNFT} from "../test/MockSonicNFT.sol";

contract Deploy_vSVault is Script {
    function run() external returns (address, address, address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy vSToken
        vSToken vsToken = new vSToken();

        // 2. Deploy MockSonicNFT
        MockSonicNFT mockSonicNFT = new MockSonicNFT();

        // 3. Deploy vSVault, linking the other two contracts
        vSVault vault = new vSVault(address(vsToken), address(mockSonicNFT));

        // 4. Grant minting rights from vSToken to the Vault
        vsToken.transferOwnership(address(vault));

        // 5. Mint a test NFT to the deployer
        // (1,000,000 tokens, vesting over 30 days)
        uint256 oneMillionTokens = 1_000_000 * 10**18;
        uint256 thirtyDays = 30 days;
        mockSonicNFT.safeMint(msg.sender, oneMillionTokens, thirtyDays);

        vm.stopBroadcast();

        return (address(vsToken), address(mockSonicNFT), address(vault));
    }
} 