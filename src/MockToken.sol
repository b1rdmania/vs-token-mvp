// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract TestSonicToken is ERC20, Ownable {
    constructor() ERC20("Test Sonic", "tS") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Faucet: anyone can mint themselves 1000 tS tokens for testing
    function faucet() external {
        uint256 faucetAmount = 1000 * 1e18;
        _mint(msg.sender, faucetAmount);
    }
} 