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
    
    /**
     * @notice Ultra gas-efficient mint for small demo amounts
     * @dev Assembly-optimized mint with minimal checks for demo purposes only
     */
    function demoMint(address to, uint256 amount) external {
        require(msg.sender == minter, "Not minter");
        require(amount <= 1000e18, "Demo mint: max 1000 tokens");
        
        // Assembly-optimized mint for small amounts
        assembly {
            // Load total supply slot
            let totalSupplySlot := 0x02  // ERC20 totalSupply is at slot 2
            let currentSupply := sload(totalSupplySlot)
            
            // Calculate new total supply
            let newSupply := add(currentSupply, amount)
            
            // Store new total supply
            sstore(totalSupplySlot, newSupply)
            
            // Calculate balance storage slot for 'to' address
            mstore(0x00, to)
            mstore(0x20, 0x00)  // ERC20 balances mapping is at slot 0
            let balanceSlot := keccak256(0x00, 0x40)
            
            // Load current balance
            let currentBalance := sload(balanceSlot)
            
            // Store new balance
            sstore(balanceSlot, add(currentBalance, amount))
        }
        
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == minter, "Not minter");
        _burn(from, amount);
    }

    /**
     * @dev DEMO ONLY - Emergency mint function for bootstrap liquidity
     * @notice WARNING: This function will be removed in production
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function emergencyMint(address to, uint256 amount) external onlyOwner {
        require(amount <= 50000e18, "DEMO: Exceeds emergency limit");
        _mint(to, amount);
    }
} 