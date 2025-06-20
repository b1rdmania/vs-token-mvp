// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title vSToken
 * @dev An ERC20 token that can only be minted and burned by its owner (the Vault contract).
 */
contract vSToken is ERC20, Ownable {

    constructor() ERC20("vS Token", "vS") Ownable(msg.sender) {}

    /**
     * @notice Creates `amount` tokens and assigns them to `to`.
     * @dev Can only be called by the owner (the vault).
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Destroys `amount` tokens from `account`.
     * @dev Can only be called by the owner (the vault).
     * @param account The address whose tokens will be burned.
     * @param amount The amount of tokens to burn.
     */
    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }
} 