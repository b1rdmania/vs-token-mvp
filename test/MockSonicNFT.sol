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
    
    // Allow delegation of claiming rights to vaults
    mapping(uint256 => address) public claimDelegates;

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

    function claimable(uint256 tokenId) public view returns (uint256) {
        VestingInfo storage schedule = vestingSchedules[tokenId];
        uint256 totalVested = getVestedAmount(tokenId);
        if (totalVested <= schedule.claimedAmount) {
            return 0;
        }
        return totalVested - schedule.claimedAmount;
    }

    /**
     * @notice Delegate claiming rights for a specific NFT to another address (e.g., vault)
     * @param tokenId The NFT to delegate
     * @param delegate The address that can claim on behalf of the owner (address(0) to revoke)
     */
    function setClaimDelegate(uint256 tokenId, address delegate) external {
        require(ownerOf(tokenId) == msg.sender, "Only owner can delegate");
        claimDelegates[tokenId] = delegate;
    }

    function claimVestedTokens(uint256 tokenId) external returns (uint256) {
        address nftOwner = ownerOf(tokenId);
        address delegate = claimDelegates[tokenId];
        
        // Allow either the owner or their delegate to claim
        require(msg.sender == nftOwner || msg.sender == delegate, "Not authorized to claim");
        
        VestingInfo storage schedule = vestingSchedules[tokenId];
        uint256 claimableAmount = claimable(tokenId);

        if (claimableAmount > 0) {
            schedule.claimedAmount += claimableAmount;
            
            // If delegate is claiming, send tokens to the delegate (vault)
            // If owner is claiming, send to owner
            address recipient = (msg.sender == delegate && delegate != address(0)) ? delegate : nftOwner;
            underlyingToken.transfer(recipient, claimableAmount);
        }

        return claimableAmount;
    }

    // Make NFTs soulbound (non-transferable) like real Sonic fNFTs
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) but prevent transfers
        if (from != address(0) && to != address(0)) {
            revert("Transfers disabled: soulbound NFT");
        }
        
        return super._update(to, tokenId, auth);
    }

    function getTotalAmount(uint256 tokenId) public view returns (uint256) {
        return vestingSchedules[tokenId].principalAmount;
    }
} 