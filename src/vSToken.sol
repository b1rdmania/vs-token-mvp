// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract VSToken is ERC20, Ownable {
    address public minter;

    constructor() ERC20("Demo vS", "D-vS") Ownable(msg.sender) {}

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Not minter");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == minter, "Not minter");
        _burn(from, amount);
    }

    /**
     * @dev Emergency mint function for bootstrap liquidity
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function emergencyMint(address to, uint256 amount) external onlyOwner {
        require(amount <= 50000e18, "Exceeds emergency limit");
        _mint(to, amount);
    }
} 