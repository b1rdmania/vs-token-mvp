// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

// A simple ERC20 token for testing purposes.
contract MockSToken is ERC20 {
    constructor() ERC20("Mock S Token", "S") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
} 