// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract MockSonicNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    IERC20 public immutable underlyingToken;

    struct VestingInfo {
        uint256 principalAmount;
        uint256 vestingStart;
        uint256 vestingDuration;
        uint256 claimedAmount;
    }

    mapping(uint256 => VestingInfo) public vestingSchedules;

    constructor(address _underlyingToken) ERC721("Mock Sonic NFT", "mSNFT") Ownable(msg.sender) {
        underlyingToken = IERC20(_underlyingToken);
    }

    function fund(uint256 amount) public onlyOwner {
        underlyingToken.transferFrom(msg.sender, address(this), amount);
    }

    function safeMint(address to, uint256 principalAmount, uint256 vestingDuration) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        vestingSchedules[tokenId] = VestingInfo({
            principalAmount: principalAmount,
            vestingStart: block.timestamp,
            vestingDuration: vestingDuration,
            claimedAmount: 0
        });
    }

    function getVestedAmount(uint256 tokenId) public view returns (uint256) {
        VestingInfo storage schedule = vestingSchedules[tokenId];
        if (block.timestamp < schedule.vestingStart) {
            return 0;
        }

        uint256 elapsedTime = block.timestamp - schedule.vestingStart;
        if (elapsedTime >= schedule.vestingDuration) {
            return schedule.principalAmount;
        }

        return (schedule.principalAmount * elapsedTime) / schedule.vestingDuration;
    }

    function claimVestedTokens(uint256 tokenId) external returns (uint256) {
        VestingInfo storage schedule = vestingSchedules[tokenId];
        uint256 totalVested = getVestedAmount(tokenId);
        uint256 claimable = totalVested - schedule.claimedAmount;

        if (claimable > 0) {
            schedule.claimedAmount += claimable;
            underlyingToken.transfer(msg.sender, claimable);
        }

        return claimable;
    }

    function getTotalAmount(uint256 tokenId) public view returns (uint256) {
        return vestingSchedules[tokenId].principalAmount;
    }
} 