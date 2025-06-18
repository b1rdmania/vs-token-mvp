// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// A simple ERC721 token for testing purposes.
contract MockfNFT is ERC721 {
    uint256 private _nextTokenId;

    constructor() ERC721("Mock fNFT", "mfNFT") {}

    function mint(address to) external {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }
} 