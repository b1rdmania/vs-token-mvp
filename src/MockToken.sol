// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title TestSonicToken - DEMO CONTRACT ONLY
 * @dev ⚠️  This contract is for DEMO purposes only!
 * 
 * Simple test token with faucet functionality for demonstrations.
 * Contains owner functions and faucet for demo setup.
 * 
 * DO NOT USE THIS CONTRACT FOR MAINNET DEPLOYMENT
 */
contract TestSonicToken is ERC20, Ownable {
    // Track who has used the faucet to prevent abuse
    mapping(address => bool) public hasClaimed;
    
    constructor() ERC20("Test Sonic", "tS") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Faucet: each address can mint themselves 1000 tS tokens once for testing
    function faucet() external {
        require(!hasClaimed[msg.sender], "Already claimed from faucet");
        hasClaimed[msg.sender] = true;
        
        uint256 faucetAmount = 1000 * 1e18;
        _mint(msg.sender, faucetAmount);
    }
} 