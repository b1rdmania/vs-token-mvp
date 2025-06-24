// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract MockToken is ERC20, Ownable {
    constructor() ERC20("Mock Token", "MTKN") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
} 