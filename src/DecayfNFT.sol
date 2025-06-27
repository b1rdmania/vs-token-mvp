// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

/**
 * @title TestSonicDecayfNFT - DEMO CONTRACT ONLY
 * @dev ⚠️  This contract is for DEMO purposes only!
 * 
 * Simulates Sonic's vesting NFT mechanics for testing and demonstration.
 * Contains owner functions for demo setup and faucet functionality.
 * 
 * DO NOT USE THIS CONTRACT FOR MAINNET DEPLOYMENT
 */
contract TestSonicDecayfNFT is ERC721, Ownable {
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
    
    // Track who has minted a demo NFT to prevent abuse
    mapping(address => bool) public hasMintedDemo;

    constructor(address _underlyingToken) ERC721("Test Sonic Vesting NFT", "tS-fNFT") Ownable(msg.sender) {
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
    
    /**
     * @notice Demo mint function - each address can mint one demo NFT
     * @dev Limited to prevent abuse during demo phase
     */
    function demoMint() external {
        require(!hasMintedDemo[msg.sender], "Already minted demo NFT");
        hasMintedDemo[msg.sender] = true;
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        // Create a demo vesting schedule: 500 tokens over 365 days
        vestingSchedules[tokenId] = VestingInfo({
            principalAmount: 500e18,
            vestingStart: block.timestamp,
            vestingDuration: 365 days,
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
        
        // Allow owner, approved addresses, or delegate to claim
        require(
            msg.sender == nftOwner ||
            getApproved(tokenId) == msg.sender ||
            isApprovedForAll(nftOwner, msg.sender) ||
            msg.sender == delegate,
            "Not authorized to claim"
        );
        
        VestingInfo storage schedule = vestingSchedules[tokenId];
        uint256 claimableAmount = claimable(tokenId);
        require(claimableAmount > 0, "Nothing to claim");
        
        schedule.claimedAmount += claimableAmount;
        
        // If delegate is claiming, send tokens to the delegate (vault)
        // Otherwise send to the message sender
        address recipient = (msg.sender == delegate && delegate != address(0)) ? delegate : msg.sender;
        underlyingToken.transfer(recipient, claimableAmount);
        
        return claimableAmount;
    }

    function getTotalAmount(uint256 tokenId) public view returns (uint256) {
        return vestingSchedules[tokenId].principalAmount;
    }

    // Make NFTs non-transferable (soulbound): block all transfers except mint (from == address(0)) and burn (to == address(0))
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Only allow mint (from == 0) and burn (to == 0)
        if (from != address(0) && to != address(0)) {
            revert("Transfers disabled: soulbound NFT");
        }
        return super._update(to, tokenId, auth);
    }
} 