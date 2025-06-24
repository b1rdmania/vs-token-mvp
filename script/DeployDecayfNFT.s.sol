// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {MockToken} from "../src/MockToken.sol";
import {DecayfNFT} from "../src/DecayfNFT.sol";

contract DeployDecayfNFT is Script {
    function run() external returns (address, address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockToken (the underlying asset)
        MockToken mockToken = new MockToken();

        // 2. Deploy DecayfNFT, linking it to the underlying token
        DecayfNFT decayfNFT = new DecayfNFT(address(mockToken));

        // 3. Fund the DecayfNFT contract with 1M tokens
        uint256 initialFunding = 1_000_000 * 10**18;
        mockToken.mint(deployer, initialFunding);
        mockToken.approve(address(decayfNFT), initialFunding);
        decayfNFT.fund(initialFunding);

        // 4. Mint a test NFT to the deployer (100,000 tokens, 30 days vesting)
        uint256 principal = 100_000 * 10**18;
        uint256 duration = 30 days;
        decayfNFT.safeMint(deployer, principal, duration);

        vm.stopBroadcast();

        return (address(decayfNFT), address(mockToken));
    }
} 