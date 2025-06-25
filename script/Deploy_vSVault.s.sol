// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {vSVault} from "../src/vSVault.sol";
import {VSToken} from "../src/VSToken.sol";
import {MockSonicNFT} from "../test/MockSonicNFT.sol";
import {MockSToken} from "../test/MockSToken.sol";

contract Deploy_vSVault is Script {
    function run() external returns (address, address, address, address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockSToken (the underlying asset)
        MockSToken mockSToken = new MockSToken();
        
        // 2. Deploy vSToken
        VSToken vsToken = new VSToken();

        // 3. Deploy MockSonicNFT, linking it to the underlying S-Token
        MockSonicNFT mockSonicNFT = new MockSonicNFT(address(mockSToken));

        // 4. Fund the MockSonicNFT contract with 100M S-Tokens to cover vesting
        uint256 initialFunding = 100_000_000 * 10**18;
        mockSToken.mint(deployer, initialFunding);
        mockSToken.approve(address(mockSonicNFT), initialFunding);
        mockSonicNFT.fund(initialFunding);
        
        // 5. Deploy vSVault (deployer address as treasury)
        vSVault vault = new vSVault(address(vsToken), address(mockSToken), deployer);

        // 6. Set the trusted NFT contract on the vault
        vault.setNFTContract(address(mockSonicNFT));

        // 7. Grant minting/burning rights from vSToken to the Vault
        vsToken.setMinter(address(vault));
        vsToken.transferOwnership(address(vault));

        // 8. Mint a test NFT to the deployer
        // (1,000,000 tokens, vesting over 30 days)
        uint256 oneMillionTokens = 1_000_000 * 10**18;
        uint256 thirtyDays = 30 days;
        mockSonicNFT.safeMint(deployer, oneMillionTokens, thirtyDays);

        vm.stopBroadcast();

        return (address(vsToken), address(mockSonicNFT), address(vault), address(mockSToken));
    }
} 