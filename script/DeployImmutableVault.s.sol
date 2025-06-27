// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ImmutableVault} from "../src/ImmutableVault.sol";
import {ImmutableVSToken} from "../src/ImmutableVSToken.sol";
import {TestSonicDecayfNFT} from "../src/DecayfNFT.sol";
import {TestSonicToken} from "../src/MockToken.sol";

/**
 * @title Deploy Ultra-Minimal Immutable Vault
 * @notice Deploys the irreducible minimum vS vault with zero admin controls
 */
contract DeployImmutableVault is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // Deploy test token
        TestSonicToken token = new TestSonicToken();
        
        // Calculate vault address
        address vaultAddr = computeCreateAddress(deployer, vm.getNonce(deployer) + 2);
        
        // Deploy vS token
        ImmutableVSToken vsToken = new ImmutableVSToken(vaultAddr, "vS Token", "vS");
        
        // Deploy NFT
        TestSonicDecayfNFT nft = new TestSonicDecayfNFT(address(token));
        
        // Deploy vault
        ImmutableVault vault = new ImmutableVault(
            address(vsToken),
            address(nft),
            address(token),
            deployer, // treasury
            block.timestamp + 270 days, // maturity
            block.timestamp + 30 days   // freeze
        );
        
        // Verify address matches
        require(address(vault) == vaultAddr, "Address mismatch");
        
        // Fund NFT contract
        token.mint(deployer, 100_000_000 * 1e18);
        token.approve(address(nft), 100_000_000 * 1e18);
        nft.fund(100_000_000 * 1e18);
        
        // Mint test NFTs
        nft.safeMint(deployer, 10_000 * 1e18, 270 days);
        nft.safeMint(deployer, 25_000 * 1e18, 270 days);
        
        console.log("Vault:", address(vault));
        console.log("vS Token:", address(vsToken));
        console.log("Test Token:", address(token));
        console.log("Test NFT:", address(nft));
        
        vm.stopBroadcast();
    }
} 