// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {VSToken} from "./VSToken.sol";

interface ITestSonicDecayfNFT is IERC721 {
    function vestingSchedules(uint256 tokenId) external view returns (
        uint256 principalAmount,
        uint256 vestingStart,
        uint256 vestingDuration,
        uint256 claimedAmount
    );
    function claimable(uint256 tokenId) external view returns (uint256);
}

contract TestVault is Ownable {
    IERC20 public tS;
    ITestSonicDecayfNFT public fNFT;
    VSToken public vS;

    // tokenId => owner
    mapping(uint256 => address) public depositedBy;

    event Deposited(address indexed user, uint256 indexed tokenId, uint256 tvSMinted);
    event Redeemed(address indexed user, uint256 indexed tokenId, uint256 tSRedeemed, uint256 tvSBurned);

    constructor(address _tS) Ownable(msg.sender) {
        tS = IERC20(_tS);
    }

    function setFNFT(address _fNFT) external onlyOwner {
        fNFT = ITestSonicDecayfNFT(_fNFT);
    }

    function setVSToken(address _vS) external onlyOwner {
        vS = VSToken(_vS);
    }

    function fundVault(uint256 amount) external onlyOwner {
        tS.transferFrom(msg.sender, address(this), amount);
    }

    // Deposit fNFT and mint tvS according to Sonic penalty logic
    function depositAndMint(uint256 tokenId) external {
        // Transfer NFT to vault (permanently locked)
        fNFT.safeTransferFrom(msg.sender, address(this), tokenId);
        depositedBy[tokenId] = msg.sender;

        // Get vesting info
        (uint256 principal, uint256 start, uint256 duration, uint256 claimed) = fNFT.vestingSchedules(tokenId);
        require(duration > 0, "Invalid vesting");
        uint256 elapsed = block.timestamp > start ? block.timestamp - start : 0;
        if (elapsed > duration) elapsed = duration;
        uint256 claimable = (principal * elapsed) / duration;
        uint256 unvested = principal - claimable;
        uint256 timeRemaining = duration - elapsed;
        uint256 penalty = (duration == 0) ? 0 : (timeRemaining * 1e18) / duration; // scaled by 1e18
        uint256 discountedUnvested = (unvested * (1e18 - penalty)) / 1e18;
        uint256 tvSMint = claimable + discountedUnvested;

        vS.mint(msg.sender, tvSMint);
        emit Deposited(msg.sender, tokenId, tvSMint);
    }

    // Redeem tS as it vests by burning tvS
    function redeem(uint256 tokenId) external {
        require(depositedBy[tokenId] == msg.sender, "Not depositor");
        (,, uint256 duration, uint256 claimed) = fNFT.vestingSchedules(tokenId);
        uint256 claimableNow = fNFT.claimable(tokenId);
        require(claimableNow > claimed, "Nothing to redeem");
        uint256 redeemable = claimableNow - claimed;
        // User must burn tvS equal to redeemable
        vS.transferFrom(msg.sender, address(this), redeemable);
        vS.burn(address(this), redeemable);
        // Send tS to user
        tS.transfer(msg.sender, redeemable);
        emit Redeemed(msg.sender, tokenId, redeemable, redeemable);
    }

    // Required for safeTransferFrom
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
} 