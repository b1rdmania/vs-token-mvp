// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MockSonicNFT} from "../src/mocks/MockSonicNFT.sol";

/**
 * @title Deploy Mock Sonic fNFT
 * @notice Deploys a mock Sonic fNFT contract for testing
 * @dev Run with: forge script script/DeployMockSonicNFT.s.sol --broadcast --verify
 */
contract DeployMockSonicNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the mock Sonic NFT contract
        MockSonicNFT mockSonicNFT = new MockSonicNFT();

        console.log("MockSonicNFT deployed at:", address(mockSonicNFT));

        vm.stopBroadcast();
    }
}
