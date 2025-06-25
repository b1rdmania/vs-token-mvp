// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {vSVault} from "../src/vSVault.sol";
import {VSToken} from "../src/VSToken.sol";
import {MockSonicNFT} from "../test/MockSonicNFT.sol";
import {TestSonicToken} from "../src/MockToken.sol"; // This one has faucet!

contract DeployDemo is Script {
    function run() external returns (address, address, address, address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy TestSonicToken (has faucet function!)
        TestSonicToken testSonicToken = new TestSonicToken();
        
        // 2. Deploy vSToken 
        VSToken vsToken = new VSToken();

        // 3. Deploy MockSonicNFT, linking it to the underlying S-Token
        MockSonicNFT mockSonicNFT = new MockSonicNFT(address(testSonicToken));

        // 4. Fund the MockSonicNFT contract with 100M S-Tokens
        uint256 initialFunding = 100_000_000 * 10**18;
        testSonicToken.mint(deployer, initialFunding);
        testSonicToken.approve(address(mockSonicNFT), initialFunding);
        mockSonicNFT.fund(initialFunding);
        
        // 5. Deploy vSVault (deployer as treasury)
        vSVault vault = new vSVault(address(vsToken), address(testSonicToken), deployer);

        // 6. Set the trusted NFT contract
        vault.setNFTContract(address(mockSonicNFT));

        // 7. Grant minting/burning rights to vault
        vsToken.setMinter(address(vault));
        vsToken.transferOwnership(address(vault));

        // 8. Mint test NFT to deployer
        uint256 oneMillionTokens = 1_000_000 * 10**18;
        uint256 thirtyDays = 30 days;
        mockSonicNFT.safeMint(deployer, oneMillionTokens, thirtyDays);

        // 9. Emergency mint some D-vS tokens for demo pool
        vault.emergencyMint(deployer, 1000 * 10**18);

        vm.stopBroadcast();

        console.log("=== Demo Deployment Complete ===");
        console.log("tS Token (with faucet):", address(testSonicToken));
        console.log("D-vS Token:", address(vsToken)); 
        console.log("fNFT Contract:", address(mockSonicNFT));
        console.log("Vault:", address(vault));
        console.log("Demo NFT minted to:", deployer);
        console.log("Emergency minted 1000 D-vS to:", deployer);

        return (address(vsToken), address(mockSonicNFT), address(vault), address(testSonicToken));
    }
} 