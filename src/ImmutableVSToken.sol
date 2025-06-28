// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "./base/ERC20.sol";

/**
 * @title ImmutableVSToken - Production Token Contract
 * @dev Immutable ERC-20 token with zero admin control after deployment
 * 
 * Key Features:
 * - No owner functions
 * - No admin control
 * - Single minter address set permanently in constructor
 * - Cannot be paused or modified after deployment
 * 
 * Use this contract for production deployment.
 * For demo/testing, use VSToken.sol which has admin functions.
 */
contract ImmutableVSToken is ERC20 {
    /// @notice The only address authorized to mint/burn tokens (vault contract)
    address public immutable minter;

    /**
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
     * @dev Only callable by the immutable minter address (vault)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Only minter can mint");
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from an address
     * @dev Only callable by the immutable minter address (vault)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external {
        require(msg.sender == minter, "Only minter can burn");
        _burn(from, amount);
    }
} 