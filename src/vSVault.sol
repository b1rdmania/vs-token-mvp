// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {ERC721Holder} from "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC721} from "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {vSToken} from "./vSToken.sol";
import {MockSonicNFT} from "../test/MockSonicNFT.sol";

/**
 * @title vSVault
 * @dev A vault that holds Sonic vesting NFTs (ERC721) as collateral
 * and allows users to mint vS (ERC20) tokens against the vested value.
 */
contract vSVault is ERC721Holder, Ownable {
    /// @dev The underlying asset of the vault, which is the vS token itself.
    vSToken public immutable vsToken;

    /// @dev The address of the Sonic NFT (ERC721) contract that this vault accepts.
    address public immutable sonicNFT;

    /// @dev Maps an NFT ID to the original address that deposited it.
    mapping(uint256 => address) public nftOriginalOwner;
    
    /// @dev Maps a user to the amount of vS they have minted for a specific NFT.
    mapping(address => mapping(uint256 => uint256)) public mintedPerNFT;

    /// @dev Thrown when a user tries to withdraw an NFT they didn't deposit.
    error NotNFTOwner();

    /// @notice Emitted when an NFT is deposited into the vault
    event NFTDeposited(address indexed user, uint256 indexed nftId, uint256 totalValue);
    /// @notice Emitted when an NFT is withdrawn from the vault
    event NFTWithdrawn(address indexed user, uint256 indexed nftId);
    /// @notice Emitted when vS is minted
    event VSMinted(address indexed user, uint256 indexed nftId, uint256 amount);
    /// @notice Emitted when vS is burned
    event VSBurned(address indexed user, uint256 indexed nftId, uint256 amount);

    /**
     * @param _vsToken The address of the vS token contract.
     * @param _sonicNFT The address of the Sonic vesting NFT contract.
     */
    constructor(
        address _vsToken,
        address _sonicNFT
    ) Ownable(msg.sender) {
        vsToken = vSToken(_vsToken);
        sonicNFT = _sonicNFT;
    }

    /**
     * @notice Deposits a specific Sonic NFT into the vault.
     * @param nftId The ID of the Sonic NFT to deposit.
     */
    function depositNFT(uint256 nftId) external {
        require(nftOriginalOwner[nftId] == address(0), "NFT already deposited");
        nftOriginalOwner[nftId] = msg.sender;

        // Transfer the NFT from the user to the vault
        IERC721(sonicNFT).safeTransferFrom(msg.sender, address(this), nftId);

        uint256 totalValue = MockSonicNFT(sonicNFT).getTotalAmount(nftId);
        emit NFTDeposited(msg.sender, nftId, totalValue);
    }

    /**
     * @notice Allows a user to mint vS tokens against their deposited NFT's vested value.
     * @param nftId The ID of the deposited NFT.
     */
    function mintVS(uint256 nftId) external {
        if (nftOriginalOwner[nftId] != msg.sender) {
            revert NotNFTOwner();
        }

        uint256 vestedAmount = MockSonicNFT(sonicNFT).getVestedAmount(nftId);
        uint256 previouslyMinted = mintedPerNFT[msg.sender][nftId];
        uint256 mintableAmount = vestedAmount - previouslyMinted;

        require(mintableAmount > 0, "No new value has vested");

        mintedPerNFT[msg.sender][nftId] += mintableAmount;
        vsToken.mint(msg.sender, mintableAmount);

        emit VSMinted(msg.sender, nftId, mintableAmount);
    }
    
    /**
     * @notice Withdraws a specific Sonic NFT from the vault.
     * @dev The NFT must be fully vested before it can be withdrawn.
     * @param nftId The ID of the Sonic NFT to withdraw.
     */
    function withdrawNFT(uint256 nftId) external {
        if (nftOriginalOwner[nftId] != msg.sender) {
            revert NotNFTOwner();
        }
        
        uint256 totalValue = MockSonicNFT(sonicNFT).getTotalAmount(nftId);
        uint256 vestedAmount = MockSonicNFT(sonicNFT).getVestedAmount(nftId);

        require(vestedAmount >= totalValue, "NFT not fully vested");

        // Clear the owner mapping
        delete nftOriginalOwner[nftId];

        // Transfer the NFT back to the original owner
        IERC721(sonicNFT).safeTransferFrom(address(this), msg.sender, nftId);
        emit NFTWithdrawn(msg.sender, nftId);
    }

    /**
     * @dev The total amount of assets under management.
     * This is the total supply of the vS token, representing all vested value claimed.
     */
    function totalAssets() public view returns (uint256) {
        return vsToken.totalSupply();
    }
} 