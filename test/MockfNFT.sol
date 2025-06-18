// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

// A simple ERC721 token for testing purposes, now with vesting logic.
contract MockfNFT is ERC721 {
    uint256 public nextId;
    uint256 public constant VESTING_PERIOD = 270 days;

    struct VestingInfo {
        uint256 totalS;
        uint256 startTime;
    }

    mapping(uint256 => VestingInfo) public vestingInfo;

    constructor() ERC721("Mock fNFT", "fNFT") {}

    function mint(address to, uint256 totalS) external returns (uint256) {
        uint256 id = nextId++;
        _mint(to, id);
        vestingInfo[id] = VestingInfo({
            totalS: totalS,
            startTime: block.timestamp
        });
        return id;
    }

    // Returns the current claimable S for a given tokenId
    function claimable(uint256 tokenId) public view returns (uint256) {
        VestingInfo memory info = vestingInfo[tokenId];
        if (block.timestamp <= info.startTime) return 0;
        uint256 elapsed = block.timestamp - info.startTime;
        if (elapsed >= VESTING_PERIOD) return info.totalS;
        return (info.totalS * elapsed) / VESTING_PERIOD;
    }

    // Returns the current penalty as a percentage (1e18 = 100%)
    function penalty(uint256 tokenId) public view returns (uint256) {
        VestingInfo memory info = vestingInfo[tokenId];
        if (block.timestamp <= info.startTime) return 1e18;
        uint256 elapsed = block.timestamp - info.startTime;
        if (elapsed >= VESTING_PERIOD) return 0;
        return 1e18 - (1e18 * elapsed) / VESTING_PERIOD;
    }
} 