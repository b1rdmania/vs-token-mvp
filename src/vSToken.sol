// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title VSToken
 * @dev An ERC20 token that can only be minted and burned by a designated Vault contract.
 * The Vault address is set once by the owner of this contract.
 */
contract VSToken is ERC20, Ownable {
    address public vault;

    /// @notice Emitted when tokens are minted by the vault
    event Mint(address indexed to, uint256 amount);
    /// @notice Emitted when tokens are burned by the vault
    event Burn(address indexed from, uint256 amount);

    /**
     * @dev Throws if called by any account other than the vault.
     */
    modifier onlyVault() {
        require(msg.sender == vault, "VSToken: Caller is not the vault");
        _;
    }

    constructor() ERC20("vS Token", "vS") Ownable(msg.sender) {}

    /**
     * @dev Sets the vault address. Can only be called once by the owner.
     * @param _vault The address of the vault contract.
     */
    function setVault(address _vault) external onlyOwner {
        require(vault == address(0), "VSToken: Vault address already set");
        require(_vault != address(0), "VSToken: Vault address cannot be zero");
        vault = _vault;
    }

    /**
     * @notice Creates `amount` tokens and assigns them to `to`, only callable by the vault.
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyVault {
        _mint(to, amount);
        emit Mint(to, amount);
    }

    /**
     * @notice Destroys `amount` tokens from `from`, only callable by the vault.
     * @param from The address whose tokens will be burned.
     * @param amount The amount of tokens to burn.
     */
    function burn(address from, uint256 amount) public onlyVault {
        _burn(from, amount);
        emit Burn(from, amount);
    }
} 