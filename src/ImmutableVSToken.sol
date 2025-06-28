// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "./base/ERC20.sol";

/**
 * @title ImmutableVSToken - Vault-Minted Liquidity Token
 * @author vS Vault Team
 * @notice ERC-20 token representing claims on vesting NFT value, tradeable before maturity
 * 
 * @dev DESIGN PRINCIPLES:
 * 1. IMMUTABLE: No admin functions, no owner, no upgrades possible after deployment
 * 2. SINGLE MINTER: Only the vault contract can mint/burn tokens (set in constructor)
 * 3. STANDARD ERC-20: Full compatibility with DEXs, lending protocols, and DeFi infrastructure
 * 4. ZERO ADMIN RISK: Cannot be paused, upgraded, or modified by any party
 * 
 * @dev ECONOMIC FUNCTION:
 * - Represents proportional claims on vault's underlying token balance
 * - Minted when users deposit vesting NFTs into vault (99% of face value)
 * - Burned when users redeem for underlying tokens (proportional to vault balance)
 * - Trades freely on secondary markets at market-determined prices
 * 
 * @dev SECURITY FEATURES:
 * - Immutable minter address prevents unauthorized token creation
 * - No admin functions eliminate rug pull vectors
 * - Standard ERC-20 implementation reduces smart contract risk
 * - Single-purpose design minimizes attack surface
 * 
 * @dev USAGE:
 * - Users receive vS tokens when depositing fNFTs to vault
 * - vS tokens can be traded, used as collateral, or provided as liquidity
 * - At maturity, vS tokens can be redeemed 1:1 for underlying S tokens
 * - Market pricing reflects time value and liquidity premium
 */
contract ImmutableVSToken is ERC20 {
    /// @notice The only address authorized to mint/burn tokens (vault contract)
    /// @dev Set once in constructor, cannot be changed - eliminates admin risk
    address public immutable minter;

    /**
     * @notice Deploy immutable vS token with fixed minter
     * @dev Once deployed, no parameters can be changed. Minter address is permanent.
     * @param _minter The vault contract address that can mint/burn tokens
     * @param _name Token name (e.g., "vS Token")
     * @param _symbol Token symbol (e.g., "vS")
     */
    constructor(
        address _minter,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol, 18) {
        require(_minter != address(0), "Minter cannot be zero address");
        minter = _minter;
    }

    /**
     * @notice Mint tokens to an address
     * @dev CRITICAL: Only callable by the immutable minter address (vault)
     * @dev Used when users deposit fNFTs - vault mints vS tokens to user
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (18 decimal precision)
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Only minter can mint");
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from an address
     * @dev CRITICAL: Only callable by the immutable minter address (vault)
     * @dev Used when users redeem vS tokens for underlying S tokens
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn (18 decimal precision)
     */
    function burn(address from, uint256 amount) external {
        require(msg.sender == minter, "Only minter can burn");
        _burn(from, amount);
    }
} 