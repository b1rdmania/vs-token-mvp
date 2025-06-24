// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {DemoToken} from "../src/MockToken.sol";
import {DemoDecayfNFT} from "../src/DecayfNFT.sol";

contract DeployDemoDecayfNFT is Script {
    function run() external returns (address, address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy DemoToken (the underlying asset)
        DemoToken demoToken = new DemoToken();

        // 2. Deploy DemoDecayfNFT, linking it to the underlying token
        DemoDecayfNFT demoDecayfNFT = new DemoDecayfNFT(address(demoToken));

        // 3. Mint demo tokens to the deployer for faucet/testing
        demoToken.mint(deployer, 1_000_000 ether);

        // 4. Fund the NFT contract with demo tokens for claims
        demoToken.mint(address(demoDecayfNFT), 1_000_000 ether);

        // 5. Mint a test NFT to the deployer (principal: 1000 DEMO, duration: 30 days)
        demoDecayfNFT.safeMint(deployer, 1000 ether, 30 days);

        vm.stopBroadcast();
        return (address(demoToken), address(demoDecayfNFT));
    }
} 