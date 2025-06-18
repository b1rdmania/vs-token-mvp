// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {ERC721Holder} from "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ERC4626} from "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC4626.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC721} from "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../test/MockfNFT.sol";
import "./vSToken.sol";

/**
 * @title Vault
 * @dev An ERC4626 vault adapted to hold fNFTs (ERC721) as collateral
 * and manage the streaming of the underlying fungible token ($S).
 * It mints vS (ERC20) tokens as shares, using the claimable value from the fNFT's penalty curve.
 */
contract Vault is ERC4626, ERC721Holder, Ownable {
    /// @dev The address of the fNFT (ERC721) contract that this vault accepts.
    address public immutable fNFT;

    /// @dev Maps an NFT ID to the original address that deposited it.
    mapping(uint256 => address) public nftOriginalOwner;

    /// @dev Thrown when a user tries to withdraw an NFT they didn't deposit.
    error NotNFTOwner();

    /// @notice Emitted when an NFT is deposited into the vault
    event NFTDeposited(address indexed user, uint256 indexed nftId, uint256 value, uint256 claimableValue, uint256 penalty);
    /// @notice Emitted when an NFT is withdrawn from the vault
    event NFTWithdrawn(address indexed user, uint256 indexed nftId, uint256 value, uint256 claimableValue, uint256 penalty);
    /// @notice Emitted when vS is redeemed for S tokens
    event Redeemed(address indexed user, uint256 amount, uint256 claimableValue, uint256 penalty);

    /**
     * @param _sToken The address of the underlying fungible token ($S). This is the `asset` for ERC4626.
     * @param _fNFT The address of the fractionalized NFT contract.
     */
    constructor(
        IERC20 _sToken,
        address _fNFT
    ) ERC20("Vault Share Token", "vS") ERC4626(ERC20(address(_sToken))) Ownable(msg.sender) {
        fNFT = _fNFT;
    }

    /**
     * @notice Deposits a specific fNFT into the vault and mints vS tokens for the user.
     * @param nftId The ID of the fNFT to deposit.
     */
    function depositNFT(uint256 nftId) external {
        require(nftOriginalOwner[nftId] == address(0), "NFT already deposited");
        nftOriginalOwner[nftId] = msg.sender;

        // Transfer the NFT from the user to the vault
        IERC721(fNFT).safeTransferFrom(msg.sender, address(this), nftId);

        // Get the current claimable value and penalty from the fNFT
        uint256 claimableValue = MockfNFT(fNFT).claimable(nftId);
        uint256 penalty = MockfNFT(fNFT).penalty(nftId);

        // Mint vS tokens to the depositor based on the claimable value
        _mint(msg.sender, claimableValue);
        emit NFTDeposited(msg.sender, nftId, claimableValue, claimableValue, penalty);
    }

    /**
     * @notice Withdraws a specific fNFT from the vault by burning vS tokens.
     * @param nftId The ID of the fNFT to withdraw.
     */
    function withdrawNFT(uint256 nftId) external {
        if (nftOriginalOwner[nftId] != msg.sender) {
            revert NotNFTOwner();
        }

        uint256 claimableValue = MockfNFT(fNFT).claimable(nftId);
        uint256 penalty = MockfNFT(fNFT).penalty(nftId);

        // Burn the corresponding amount of vS tokens from the user
        _burn(msg.sender, claimableValue);

        // Clear the owner mapping
        delete nftOriginalOwner[nftId];

        // Transfer the NFT back to the original owner
        IERC721(fNFT).safeTransferFrom(address(this), msg.sender, nftId);
        emit NFTWithdrawn(msg.sender, nftId, claimableValue, claimableValue, penalty);
    }

    /**
     * @notice Redeems vS tokens for S tokens at the current claimable value.
     * @param amount The amount of vS tokens to redeem.
     */
    function redeemVS(uint256 amount) external {
        // Burn vS tokens from the user
        _burn(msg.sender, amount);
        // Transfer S tokens to the user (1:1 for claimable value)
        IERC20(asset()).transfer(msg.sender, amount);
        // For demo: penalty is 0 for direct S redemption (could be extended)
        emit Redeemed(msg.sender, amount, amount, 0);
    }

    /**
     * @dev The total amount of the underlying asset ($S) that is managed by the vault.
     * This function needs to be implemented. It should calculate the total
     * amount of $S tokens locked in all the fNFTs held by the vault.
     */
    function totalAssets() public view override returns (uint256) {
        // For now, it will return the balance of $S tokens held by the vault directly.
        // We will need to add logic to sum up the value from the NFTs.
        return IERC20(asset()).balanceOf(address(this));
    }
} 