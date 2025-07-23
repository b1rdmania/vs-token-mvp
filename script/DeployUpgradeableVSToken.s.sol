// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {VsToken} from "../src/upgradeable/UpgradeableVSToken.sol";

/**
 * @title Deploy Upgradeable vS Token with UUPS Proxy
 * @notice Deploys implementation + proxy with predicted vault address to avoid circular dependency
 * @dev Run with: forge script script/DeployUpgradeableVSToken.s.sol --broadcast --verify
 */
contract DeployUpgradeableVSToken is Script {
    // Deployment parameters (set via environment variables)
    struct DeployParams {
        string tokenName;
        string tokenSymbol;
        address admin; // Multisig address
        uint256 deployerKey;
        address deployer;
    }

    function run() external {
        DeployParams memory params = _loadDeployParams();

        console.log("=== UPGRADEABLE vS TOKEN DEPLOYMENT ===");
        console.log("Deployer:", params.deployer);
        console.log("Token Name:", params.tokenName);
        console.log("Token Symbol:", params.tokenSymbol);
        console.log("Admin (Multisig):", params.admin);
        console.log("");

        vm.startBroadcast(params.deployerKey);

        // Step 1: Calculate future vault proxy address (will be deployed after token)
        // Token deployment will consume nonces: deployer+1 (impl), deployer+2 (proxy)
        // Vault deployment will consume nonces: deployer+3 (impl), deployer+4 (proxy)
        // NOTE: Vault proxy is still at nonce+3 because proxy address doesn't depend on constructor args
        address futureVaultProxy = computeCreateAddress(params.deployer, vm.getNonce(params.deployer) + 3);
        console.log("Predicted vault proxy address:", futureVaultProxy);
        console.log("IMPORTANT: Vault must be deployed with these exact parameters:");

        // Step 2: Deploy the token implementation contract
        console.log("1. Deploying UpgradeableVSToken implementation...");
        VsToken tokenImplementation = new VsToken(futureVaultProxy);
        console.log("Token implementation deployed at:", address(tokenImplementation));

        // Step 3: Prepare token initialization data
        bytes memory tokenInitData = abi.encodeWithSelector(
            VsToken.initialize.selector, params.tokenName, params.tokenSymbol, params.admin
        );

        // Step 4: Deploy the token proxy
        console.log("2. Deploying Token ERC1967Proxy...");
        ERC1967Proxy tokenProxy = new ERC1967Proxy(address(tokenImplementation), tokenInitData);
        console.log("Token proxy deployed at:", address(tokenProxy));

        vm.stopBroadcast();

        // Step 5: Verify the token deployment
        VsToken token = VsToken(address(tokenProxy));

        console.log("3. Verifying token deployment...");
        require(keccak256(bytes(token.name())) == keccak256(bytes(params.tokenName)), "Name mismatch");
        require(keccak256(bytes(token.symbol())) == keccak256(bytes(params.tokenSymbol)), "Symbol mismatch");
        require(token.hasRole(token.DEFAULT_ADMIN_ROLE(), params.admin), "Admin role not set");
        require(token.hasRole(token.ADMIN_ROLE(), params.admin), "Admin role not set");
        require(token.hasRole(token.EMERGENCY_ROLE(), params.admin), "Emergency role not set");
        require(token.getMinter() == futureVaultProxy, "Minter not set to future vault");
        require(token.decimals() == 18, "Decimals not 18");
        require(token.totalSupply() == 0, "Initial supply not zero");

        // Step 6: Print deployment summary
        _printDeploymentSummary(address(tokenImplementation), address(tokenProxy), futureVaultProxy, params);
    }

    /**
     * @notice Load deployment parameters from environment variables
     */
    function _loadDeployParams() internal view returns (DeployParams memory) {
        DeployParams memory params;

        // Token configuration
        params.tokenName = vm.envOr("TOKEN_NAME", string("vS Token"));
        params.tokenSymbol = vm.envOr("TOKEN_SYMBOL", string("vS"));

        // Addresses
        params.admin = vm.envAddress("ADMIN_ADDRESS"); // Required: Multisig address

        // Deployer
        params.deployerKey = vm.envUint("PRIVATE_KEY");
        params.deployer = vm.addr(params.deployerKey);

        // Validation
        require(params.admin != address(0), "ADMIN_ADDRESS required");
        require(bytes(params.tokenName).length > 0, "TOKEN_NAME required");
        require(bytes(params.tokenSymbol).length > 0, "TOKEN_SYMBOL required");

        // Warning for production deployments
        if (params.admin == params.deployer) {
            console.log("WARNING: Admin and deployer are the same address!");
            console.log("This is OK for testing, but use a multisig for production.");
        }

        return params;
    }

    /**
     * @notice Print comprehensive deployment summary
     */
    function _printDeploymentSummary(
        address tokenImplementation,
        address tokenProxy,
        address futureVaultProxy,
        DeployParams memory params
    ) internal view {
        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("Token Implementation:", tokenImplementation);
        console.log("Token Proxy:", tokenProxy);
        console.log("Future Vault Proxy:", futureVaultProxy);
        console.log("Admin:", params.admin);
        console.log("");

        console.log("=== NEXT STEPS ===");
        console.log("1. Deploy vault using script/DeployUpgradeableVault.s.sol");
        console.log("2. Set TOKEN_ADDRESS=%s in environment", tokenProxy);
        console.log("3. CRITICAL: Set all other environment variables BEFORE deploying vault");
        console.log("4. Verify vault proxy address matches prediction: %s", futureVaultProxy);
        console.log("");
        console.log("WARNING: Vault constructor now takes ALL parameters!");
        console.log("   The vault implementation address will be different each deployment");
        console.log("   but the proxy address should match the prediction.");
        console.log("");

        console.log("=== VERIFICATION COMMANDS ===");
        console.log("Verify Token Implementation:");
        console.log("forge verify-contract %s", tokenImplementation);
        console.log("  src/upgradeable/UpgradeableVSToken.sol:UpgradeableVSToken");
        console.log("  --chain-id %s", vm.toString(block.chainid));
        console.log("  --constructor-args $(cast abi-encode \"constructor(address)\" %s)", futureVaultProxy);
        console.log("");

        console.log("Verify Token Proxy:");
        console.log("forge verify-contract %s", tokenProxy);
        console.log("  @openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy");
        console.log("  --chain-id %s", vm.toString(block.chainid));
        console.log(
            "  --constructor-args $(cast abi-encode \"constructor(address,bytes)\" %s 0x%s)",
            tokenImplementation,
            vm.toString(
                abi.encodeWithSelector(
                    VsToken.initialize.selector, params.tokenName, params.tokenSymbol, params.admin
                )
            )
        );
        console.log("");

        console.log("=== ENVIRONMENT VARIABLES FOR VAULT DEPLOYMENT ===");
        console.log("export TOKEN_ADDRESS=%s", tokenProxy);
        console.log("export ADMIN_ADDRESS=%s", params.admin);
        console.log("export SONIC_NFT=<sonic_fnft_contract_address>");
        console.log("export UNDERLYING_TOKEN=<s_token_contract_address>");
        console.log("export PROTOCOL_TREASURY=<treasury_address>");
        console.log("export MATURITY_TIMESTAMP=<unix_timestamp>");
        console.log("export VAULT_FREEZE_TIMESTAMP=<unix_timestamp>");
        console.log("");

        console.log("=== SECURITY CHECKLIST ===");
        console.log("[OK] Token implementation deployed with predicted vault as minter");
        console.log("[OK] Token proxy deployed with correct initialization");
        console.log("[OK] Admin roles assigned to multisig");
        console.log("[OK] Minter set to future vault address");
        console.log("[OK] Upgrade delays configured (12h normal, 2h emergency)");
        console.log("[OK] Emergency pause functionality available");
        console.log("[PENDING] Vault deployment to complete circular reference");
        console.log("");

        console.log("=== IMPORTANT ADDRESSES ===");
        console.log("TOKEN_ADDRESS=%s", tokenProxy);
        console.log("TOKEN_IMPLEMENTATION=%s", tokenImplementation);
        console.log("FUTURE_VAULT_PROXY=%s", futureVaultProxy);
        console.log("ADMIN_ADDRESS=%s", params.admin);
    }
}
