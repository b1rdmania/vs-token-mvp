// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockSonicNFT
 * @notice Mock Sonic fNFT contract for testing vS Vault
 * @dev This simulates the Sonic fNFT contract structure with ERC1155 and vesting mechanics
 */
contract MockSonicNFT is ERC1155, Ownable {
    // Season enum to match real contract
    enum Season {
        NONE,
        SEASON1,
        SEASON2,
        SEASON3,
        SEASON4,
        SEASON5
    }

    struct SeasonData {
        uint40 startTime;
        uint40 maturationTime;
        uint40 claimsBurnTime;
        uint40 lockedBurnTime;
        uint16 instantClaimAvailableBps;
        bytes32 merkleRoot;
    }

    struct ClaimsData {
        uint128 unclaimed;
        uint128 unlocked;
        uint128 locked;
        uint128 burned;
    }

    // Track total amounts per token ID when transferred to vault
    mapping(uint256 => uint256) private _vaultTotalAmounts;

    // Track total amounts per user per token ID
    mapping(address => mapping(uint256 => uint256)) private _userTotalAmounts;

    // Season data and claims tracking
    mapping(Season => SeasonData) private _seasons;
    mapping(Season => ClaimsData) private _claims;
    mapping(Season => mapping(address => bool)) private _hasMinted;

    // For mock purposes, we'll use Season.SEASON1 as the main season
    Season public constant CURRENT_SEASON = Season.SEASON1;

    constructor() ERC1155("") Ownable() {
        // Initialize Season 1 data with test-friendly timestamps
        // Use a base timestamp that works well with test scenarios
        uint40 baseTime = 1752534000; // July 15, 2025 (matches test LAUNCH_TIMESTAMP)

        _seasons[Season.SEASON1] = SeasonData({
            startTime: baseTime,
            maturationTime: baseTime + 270 * 24 * 60 * 60, // 270 days later (April 2026)
            claimsBurnTime: baseTime + 365 * 24 * 60 * 60, // 1 year later
            lockedBurnTime: baseTime + 2 * 365 * 24 * 60 * 60, // 2 years later
            instantClaimAvailableBps: 2500, // 25% instant claim
            merkleRoot: bytes32(0) // Mock root
        });

        _claims[Season.SEASON1] = ClaimsData({unclaimed: 0, unlocked: 0, locked: 0, burned: 0});

        // Don't mint test NFTs in constructor to avoid ERC1155 transfer issues during setup
        // Use mintTestNFT function instead when needed in tests
    }

    function _mintTestNFTs(address user) internal {
        // Mint Season 1 NFTs with different amounts
        uint256 amount1 = 1000 * 10 ** 18; // 1000 S tokens
        uint256 amount2 = 5000 * 10 ** 18; // 5000 S tokens

        // Calculate locked amounts (75% of total)
        uint256 locked1 = (amount1 * 7500) / 10000; // 75% locked
        uint256 locked2 = (amount2 * 7500) / 10000; // 75% locked

        // Mint ERC1155 tokens for Season 1
        _mint(user, uint256(Season.SEASON1), locked1, "");
        _mint(user, uint256(Season.SEASON1), locked2, "");

        // Mark as minted
        _hasMinted[Season.SEASON1][user] = true;

        // Update claims data
        _claims[Season.SEASON1].locked += uint128(locked1 + locked2);
    }

    // Override safeTransferFrom to track total amounts when transferring to vault
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data)
        public
        override
    {
        // If transferring to what looks like a vault, store the total amount
        if (to != address(0) && _userTotalAmounts[from][id] > 0) {
            _vaultTotalAmounts[id] = _userTotalAmounts[from][id];
        }

        super.safeTransferFrom(from, to, id, amount, data);
    }

    // Functions to match real contract interface

    function getSeasonData(Season season) external view returns (SeasonData memory) {
        return _seasons[season];
    }

    function getClaimsData(Season season) external view returns (ClaimsData memory) {
        return _claims[season];
    }

    function hasMinted(Season season, address account) external view returns (bool) {
        return _hasMinted[season][account];
    }

    function getInstantClaimBps(Season season) external view returns (uint16) {
        return _seasons[season].instantClaimAvailableBps;
    }

    // Mock function to simulate claiming airdrop
    function claimAirdropNFT(Season season, uint128 amount, bytes32[] calldata merkleProof) external {
        require(season == Season.SEASON1, "Only Season 1 supported in mock");
        require(!_hasMinted[season][msg.sender], "Already claimed");

        // Calculate instant and locked amounts
        uint128 instant = (amount * _seasons[season].instantClaimAvailableBps) / 10000;
        uint128 locked = amount - instant;

        // Mark as minted
        _hasMinted[season][msg.sender] = true;

        // Update claims data
        _claims[season].unlocked += instant;
        _claims[season].locked += locked;

        // Mint NFT for locked amount
        _mint(msg.sender, uint256(season), locked, "");
    }

    // Mock function to simulate unlocking vested tokens
    function unlockAndBurnAirdrop(Season season, uint128 amount) external {
        require(season == Season.SEASON1, "Only Season 1 supported in mock");

        uint256 balance = balanceOf(msg.sender, uint256(season));
        require(balance >= amount, "Insufficient balance");

        // Burn the NFT
        _burn(msg.sender, uint256(season), amount);

        // Update claims data
        _claims[season].locked -= amount;
        _claims[season].unlocked += amount;
    }

    // Helper function to get total amount for a token (for vault compatibility)
    function getTotalAmount(uint256 tokenId) external view returns (uint256) {
        // If we have a stored total amount for this token (from vault transfer), use it
        if (_vaultTotalAmounts[tokenId] > 0) {
            return _vaultTotalAmounts[tokenId];
        }

        // Otherwise return current balance
        return balanceOf(msg.sender, tokenId);
    }

    // Helper function to get claimable amount (for vault compatibility)
    function claimable(uint256 tokenId) external view returns (uint256) {
        // For mock purposes, return the balance as claimable
        return balanceOf(msg.sender, tokenId);
    }

    // Mock function for vault to call (simulates claiming vested tokens)
    function claimVestedTokens(uint256 tokenId) external returns (uint256) {
        // For mock purposes, return the balance as claimed amount
        uint256 balance = balanceOf(msg.sender, tokenId);
        if (balance > 0) {
            _burn(msg.sender, tokenId, balance);
        }
        return balance;
    }

    // Mock function to mint test NFTs for testing
    function mintTestNFT(address to, uint256 totalAmount) external onlyOwner {
        // Calculate locked amount (75% of total)
        uint256 locked = (totalAmount * 7500) / 10000; // 75% locked

        // Store the total amount for this user and token
        uint256 tokenId = uint256(Season.SEASON1);
        _userTotalAmounts[to][tokenId] = totalAmount;

        // Mint the locked amount as ERC1155 tokens
        _mint(to, tokenId, locked, "");
        _hasMinted[Season.SEASON1][to] = true;
        _claims[Season.SEASON1].locked += uint128(locked);
    }
}
