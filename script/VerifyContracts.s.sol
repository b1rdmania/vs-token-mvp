// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

/**
 * @title Standalone Contract Verification Script
 * @notice Verify already deployed contracts with dynamic network detection
 * @dev Usage: forge script script/VerifyContracts.s.sol --chain-id <CHAIN_ID>
 */
contract VerifyContracts is Script {
    struct VerificationConfig {
        string network;
        uint256 chainId;
        string verifierUrl;
        string explorerUrl;
        string apiKeyEnvVar;
    }

    function run() external {
        // Get addresses from environment or use defaults
        address implementation = _getRequiredAddress("IMPLEMENTATION_ADDRESS");
        address proxy = _getRequiredAddress("PROXY_ADDRESS");

        VerificationConfig memory config = _getVerificationConfig();

        console.log("=== CONTRACT VERIFICATION ===");
        console.log("Network:", config.network);
        console.log("Chain ID:", config.chainId);
        console.log("Implementation:", implementation);
        console.log("Proxy:", proxy);
        console.log("");

        string memory apiKey = _getApiKey(config.apiKeyEnvVar);
        if (bytes(apiKey).length == 0) {
            console.log("ERROR: API key not found. Set", config.apiKeyEnvVar);
            return;
        }

        // Verify implementation
        console.log("Verifying Implementation Contract...");
        _verifyContract(implementation, "src/upgradeable/UpgradeableVSToken.sol:UpgradeableVSToken", config, apiKey);

        // Verify proxy (with constructor args)
        console.log("Verifying Proxy Contract...");
        _verifyProxyContract(proxy, implementation, config, apiKey);

        console.log("");
        console.log("SUCCESS: Verification commands executed!");
        console.log("Check status at:", config.explorerUrl);
    }

    function _getVerificationConfig() internal view returns (VerificationConfig memory) {
        uint256 chainId = block.chainid;

        if (chainId == 57054) {
            return VerificationConfig({
                network: "Sonic Testnet",
                chainId: chainId,
                verifierUrl: "https://api.etherscan.io/v2/api?chainid=57054",
                explorerUrl: "https://sonicscan.org",
                apiKeyEnvVar: "SONIC_API_KEY"
            });
        } else if (chainId == 146) {
            return VerificationConfig({
                network: "Sonic Mainnet",
                chainId: chainId,
                verifierUrl: "https://api.etherscan.io/v2/api?chainid=146",
                explorerUrl: "https://sonicscan.org",
                apiKeyEnvVar: "SONIC_API_KEY"
            });
        } else if (chainId == 11155111) {
            return VerificationConfig({
                network: "Sepolia Testnet",
                chainId: chainId,
                verifierUrl: "https://api.etherscan.io/v2/api?chainid=11155111",
                explorerUrl: "https://sepolia.etherscan.io",
                apiKeyEnvVar: "ETHERSCAN_API_KEY"
            });
        } else {
            revert(string(abi.encodePacked("Unsupported chain ID: ", vm.toString(chainId))));
        }
    }

    function _verifyContract(
        address contractAddr,
        string memory contractPath,
        VerificationConfig memory config,
        string memory apiKey
    ) internal {
        string[] memory cmd = new string[](11);
        cmd[0] = "forge";
        cmd[1] = "verify-contract";
        cmd[2] = vm.toString(contractAddr);
        cmd[3] = contractPath;
        cmd[4] = "--verifier-url";
        cmd[5] = config.verifierUrl;
        cmd[6] = "--etherscan-api-key";
        cmd[7] = apiKey;
        cmd[8] = "--chain-id";
        cmd[9] = vm.toString(config.chainId);
        cmd[10] = "--watch";

        console.log("Command:");
        console.log("forge verify-contract", vm.toString(contractAddr), contractPath);
        console.log("--verifier-url", config.verifierUrl);
        console.log("--etherscan-api-key [HIDDEN]");
        console.log("--chain-id", vm.toString(config.chainId));
        console.log("--watch");

        try vm.ffi(cmd) {
            console.log("SUCCESS: Verification submitted for", vm.toString(contractAddr));
        } catch Error(string memory reason) {
            console.log("ERROR: Verification failed:", reason);
        } catch {
            console.log("ERROR: Verification failed with unknown error");
        }
    }

    function _getRequiredAddress(string memory envVar) internal view returns (address) {
        try vm.envAddress(envVar) returns (address addr) {
            require(addr != address(0), string(abi.encodePacked(envVar, " cannot be zero address")));
            return addr;
        } catch {
            revert(string(abi.encodePacked("Required environment variable not set: ", envVar)));
        }
    }

    function _verifyProxyContract(
        address proxy,
        address implementation,
        VerificationConfig memory config,
        string memory apiKey
    ) internal {
        // Get constructor args from broadcast data
        string memory constructorArgs = _getProxyConstructorArgs(proxy);

        if (bytes(constructorArgs).length == 0) {
            console.log("ERROR: Could not find constructor args for proxy");
            return;
        }

        string[] memory cmd = new string[](13);
        cmd[0] = "forge";
        cmd[1] = "verify-contract";
        cmd[2] = vm.toString(proxy);
        cmd[3] = "lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy";
        cmd[4] = "--verifier-url";
        cmd[5] = config.verifierUrl;
        cmd[6] = "--etherscan-api-key";
        cmd[7] = apiKey;
        cmd[8] = "--chain-id";
        cmd[9] = vm.toString(config.chainId);
        cmd[10] = "--constructor-args";
        cmd[11] = constructorArgs;
        cmd[12] = "--watch";

        console.log("Command:");
        console.log("forge verify-contract", vm.toString(proxy), "ERC1967Proxy");
        console.log("--constructor-args", constructorArgs);

        try vm.ffi(cmd) {
            console.log("SUCCESS: Proxy verification submitted for", vm.toString(proxy));
        } catch Error(string memory reason) {
            console.log("ERROR: Proxy verification failed:", reason);
        } catch {
            console.log("ERROR: Proxy verification failed with unknown error");
        }
    }

    function _getProxyConstructorArgs(address proxy) internal view returns (string memory) {
        // For now, try to read from environment variable
        // In the future, this could parse broadcast files automatically
        try vm.envString("PROXY_CONSTRUCTOR_ARGS") returns (string memory args) {
            return args;
        } catch {
            console.log("WARNING: PROXY_CONSTRUCTOR_ARGS not set, proxy verification may fail");
            return "";
        }
    }

    function _getApiKey(string memory envVar) internal view returns (string memory) {
        try vm.envString(envVar) returns (string memory key) {
            return key;
        } catch {
            return "";
        }
    }
}
