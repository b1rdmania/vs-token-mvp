// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC4626/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./vSToken.sol";

/**
 * @title Vault
 * @dev An ERC4626 vault adapted to hold fNFTs (ERC721) as collateral
 * and manage the streaming of the underlying fungible token ($S).
 * It mints vS (ERC20) tokens as shares.
 */
contract Vault is ERC4626, ERC721Holder, Ownable {
    /**
     * @dev The address of the fNFT (ERC721) contract that this vault accepts.
     */
    address public immutable fNFT;

    /**
     * @dev Maps an NFT ID to the original address that deposited it.
     */
    mapping(uint256 => address) public nftOriginalOwner;

    /**
     * @dev Thrown when a user tries to withdraw an NFT they didn't deposit.
     */
    error NotNFTOwner();

    // Here we can add more state variables as needed, for example:
    // mapping(uint256 => VestingSchedule) public vestingSchedules;

    /**
     * @param _sToken The address of the underlying fungible token ($S). This is the `asset` for ERC4626.
     * @param _vsToken The address of the vault's share token (vSToken). This is the `shares` for ERC4626.
     * @param _fNFT The address of the fractionalized NFT contract.
     */
    constructor(
        IERC20 _sToken,
        VSToken _vsToken,
        address _fNFT
    ) ERC4626(IERC20Metadata(_sToken), IERC20Metadata(_vsToken)) Ownable(msg.sender) {
        fNFT = _fNFT;
    }

    // =============================================================
    // =========== Overrides & Custom Functions Go Here ============
    // =============================================================

    /**
     * @dev Deposits a specific fNFT into the vault and mints vS tokens for the user.
     * @param nftId The ID of the fNFT to deposit.
     */
    function depositNFT(uint256 nftId) external {
        // 1. Record the original owner
        require(nftOriginalOwner[nftId] == address(0), "NFT already deposited");
        nftOriginalOwner[nftId] = msg.sender;

        // 2. Transfer the NFT from the user to the vault
        IERC721(fNFT).safeTransferFrom(msg.sender, address(this), nftId);

        // 3. Determine the value of the underlying S tokens in the NFT
        //    NOTE: This is a placeholder. We need a function on the fNFT contract
        //    or an oracle to get the actual locked amount.
        uint256 underlyingValue = _getUnderlyingValue(nftId);

        // 4. Mint vS tokens to the depositor based on the value
        //    The ERC4626 `_mint` function handles the shares calculation.
        _mint(msg.sender, underlyingValue);
    }

    /**
     * @dev Withdraws a specific fNFT from the vault by burning vS tokens.
     * @param nftId The ID of the fNFT to withdraw.
     */
    function withdrawNFT(uint256 nftId) external {
        // 1. Check if the caller is the original owner
        if (nftOriginalOwner[nftId] != msg.sender) {
            revert NotNFTOwner();
        }

        // 2. Determine the value of the underlying S tokens
        uint256 underlyingValue = _getUnderlyingValue(nftId);

        // 3. Burn the corresponding amount of vS tokens from the user
        _burn(msg.sender, underlyingValue);

        // 4. Clear the owner mapping
        delete nftOriginalOwner[nftId];

        // 5. Transfer the NFT back to the original owner
        IERC721(fNFT).safeTransferFrom(address(this), msg.sender, nftId);
    }

    /**
     * @dev Placeholder function to determine the value of an fNFT.
     * In a real scenario, this would interact with the fNFT contract.
     */
    function _getUnderlyingValue(uint256 nftId) internal pure returns (uint256) {
        // For the MVP, we can assume a fixed value or a simple mock logic.
        // Example: return 1000 * 1e18;
        // The actual implementation depends on the fNFT contract's interface.
        return 100 * (10**18); // Mock value: 100 tokens
    }

    /**
     * @dev The total amount of the underlying asset ($S) that is managed by the vault.
     * This function needs to be implemented. It should calculate the total
     * amount of $S tokens locked in all the fNFTs held by the vault.
     */
    function totalAssets() public view override returns (uint256) {
        // For now, it will return the balance of $S tokens held by the vault directly.
        // We will need to add logic to sum up the value from the NFTs.
        return asset.balanceOf(address(this));
    }
} 