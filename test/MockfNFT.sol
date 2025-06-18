// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

// A simple ERC721 token for testing purposes.
contract MockfNFT is ERC721 {
    uint256 public nextId;

    constructor() ERC721("Mock fNFT", "fNFT") {}

    function mint(address to) external returns (uint256) {
        uint256 id = nextId++;
        _mint(to, id);
        return id;
    }
} 