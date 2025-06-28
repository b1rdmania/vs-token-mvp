// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ImmutableVault} from "../src/ImmutableVault.sol";
import {ImmutableVSToken} from "../src/ImmutableVSToken.sol";

/**
 * @title Deploy Production Immutable Vault
 * @notice Deploys vS vault with real Season-1 parameters
 * @dev All addresses/timestamps injected via environment variables
 */
contract DeployImmutableVault is Script {
    function run() external {
        // Read deployment parameters from environment
        address sonicNFT        = vm.envAddress("SONIC_FNFT");
        address underlyingToken = vm.envAddress("UNDERLYING_S");
        address treasury        = vm.envAddress("TREASURY");
        uint256 maturityTs      = vm.envUint("MATURITY_TS");
        uint256 freezeTs        = vm.envUint("FREEZE_TS");
        
        // Validation
        require(sonicNFT != address(0), "Set SONIC_FNFT");
        require(underlyingToken != address(0), "Set UNDERLYING_S");
        require(treasury != address(0), "Set TREASURY");
        require(maturityTs > block.timestamp, "MATURITY_TS must be future");
        require(freezeTs > block.timestamp, "FREEZE_TS must be future");
        require(freezeTs < maturityTs, "Freeze before maturity");
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // Calculate vault address for vS token constructor
        address vaultAddr = computeCreateAddress(deployer, vm.getNonce(deployer) + 1);
        
        // Deploy vS token (points to future vault address)
        ImmutableVSToken vsToken = new ImmutableVSToken(vaultAddr, "vS Token", "vS");
        
        // Deploy vault with real Season-1 parameters
        ImmutableVault vault = new ImmutableVault(
            address(vsToken),
            sonicNFT,
            underlyingToken,
            treasury,
            maturityTs,
            freezeTs
        );
        
        // Verify address calculation was correct
        require(address(vault) == vaultAddr, "Address mismatch");
        
        console.log("=== SEASON-1 DEPLOYMENT COMPLETE ===");
        console.log("Vault:", address(vault));
        console.log("vS Token:", address(vsToken));
        console.log("Sonic fNFT:", sonicNFT);
        console.log("Underlying S:", underlyingToken);
        console.log("Treasury:", treasury);
        console.log("Maturity:", maturityTs);
        console.log("Freeze:", freezeTs);
        console.log("");
        console.log("=== VERIFICATION REQUIRED ===");
        console.log("1. Verify constructor args on block explorer");
        console.log("2. Test deposit() with real Season-1 fNFT");
        console.log("3. Confirm delegation works with real fNFT contract");
        console.log("4. Run full lifecycle test: deposit -> claim -> redeem");
        
        vm.stopBroadcast();
    }
} 