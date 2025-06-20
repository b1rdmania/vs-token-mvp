// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract MockSonicNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    struct VestingInfo {
        uint256 principalAmount;
        uint256 vestingStart;
        uint256 vestingDuration;
    }

    mapping(uint256 => VestingInfo) public vestingSchedules;

    constructor() ERC721("Mock Sonic NFT", "mSNFT") Ownable(msg.sender) {}

    function safeMint(address to, uint256 principalAmount, uint256 vestingDuration) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        vestingSchedules[tokenId] = VestingInfo({
            principalAmount: principalAmount,
            vestingStart: block.timestamp,
            vestingDuration: vestingDuration
        });
    }

    function getVestedAmount(uint256 tokenId) public view returns (uint256) {
        VestingInfo memory schedule = vestingSchedules[tokenId];
        if (block.timestamp < schedule.vestingStart) {
            return 0;
        }

        uint256 elapsedTime = block.timestamp - schedule.vestingStart;
        if (elapsedTime >= schedule.vestingDuration) {
            return schedule.principalAmount;
        }

        return (schedule.principalAmount * elapsedTime) / schedule.vestingDuration;
    }

    function getTotalAmount(uint256 tokenId) public view returns (uint256) {
        return vestingSchedules[tokenId].principalAmount;
    }
} 