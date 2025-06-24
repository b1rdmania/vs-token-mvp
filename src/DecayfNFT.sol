// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract DemoDecayfNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    IERC20 public immutable underlyingToken;

    struct VestingInfo {
        uint256 principalAmount;
        uint256 vestingStart;
        uint256 vestingDuration;
        uint256 claimedAmount;
    }

    mapping(uint256 => VestingInfo) public vestingSchedules;

    constructor(address _underlyingToken) ERC721("Demo Decay fNFT", "DEMOFNFT") Ownable(msg.sender) {
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
            return (schedule.principalAmount * 25) / 100;
        }
        uint256 elapsedTime = block.timestamp - schedule.vestingStart;
        uint256 initial = (schedule.principalAmount * 25) / 100;
        uint256 linear;
        if (elapsedTime >= schedule.vestingDuration) {
            linear = (schedule.principalAmount * 75) / 100;
        } else {
            linear = (schedule.principalAmount * 75 * elapsedTime) / (100 * schedule.vestingDuration);
        }
        return initial + linear;
    }

    function claimable(uint256 tokenId) public view returns (uint256) {
        VestingInfo storage schedule = vestingSchedules[tokenId];
        uint256 totalVested = getVestedAmount(tokenId);
        if (totalVested <= schedule.claimedAmount) {
            return 0;
        }
        return totalVested - schedule.claimedAmount;
    }

    function claimVestedTokens(uint256 tokenId) external returns (uint256) {
        address owner = ownerOf(tokenId);
        require(
            msg.sender == owner ||
            getApproved(tokenId) == msg.sender ||
            isApprovedForAll(owner, msg.sender),
            "Not owner or approved"
        );
        VestingInfo storage schedule = vestingSchedules[tokenId];
        uint256 claimableAmount = claimable(tokenId);
        require(claimableAmount > 0, "Nothing to claim");
        schedule.claimedAmount += claimableAmount;
        underlyingToken.transfer(msg.sender, claimableAmount);
        return claimableAmount;
    }

    function getTotalAmount(uint256 tokenId) public view returns (uint256) {
        return vestingSchedules[tokenId].principalAmount;
    }
} 