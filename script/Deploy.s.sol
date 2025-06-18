// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "src/Vault.sol";
import "src/vSToken.sol";
import "test/MockSToken.sol";
import "test/MockfNFT.sol";

contract DeployScript is Script {
    function setUp() public {}
    function run() public {
        vm.startBroadcast();
        MockSToken sToken = new MockSToken();
        MockfNFT fNFT = new MockfNFT();
        VSToken vsToken = new VSToken();
        Vault vault = new Vault(sToken, address(fNFT));
        vsToken.setVault(address(vault));
        console2.log("MockSToken:", address(sToken));
        console2.log("MockfNFT:", address(fNFT));
        console2.log("VSToken:", address(vsToken));
        console2.log("Vault:", address(vault));
        vm.stopBroadcast();
    }
} 