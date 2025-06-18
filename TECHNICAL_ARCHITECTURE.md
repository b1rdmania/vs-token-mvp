# vS Token MVP: Technical Architecture & Phased Implementation Plan

## What's Changed (June 2025)
- **Major Update:** The protocol now models Sonic fNFT vesting as a penalty-based, non-linear curve (not linear unlock). All vS minting, redemption, and valuation logic is based on the current claimable S value, which increases as the penalty decays over time. This prevents arbitrage and ensures fair value for all users.
- **Vault logic, user flows, and fee structures have been updated accordingly.**

---

## 1. Scope of Work & MVP Definition

The goal of the MVP is to create a fully functional, secure, and user-friendly platform for converting locked fNFTs into liquid vS tokens, **accurately reflecting the Sonic penalty-based vesting curve**.

#### IN SCOPE for MVP:
*   **Smart Contracts:**
    *   A vault for fNFT deposits and withdrawals, with logic based on the penalty curve (not ERC-4626 linear streaming).
    *   An ERC-20 token (`vSToken`) representing a discounted claim on S tokens, based on the current penalty.
*   **Core Functionality:**
    *   Users can deposit their vesting fNFTs into the vault.
    *   Upon deposit, users receive a corresponding amount of `vSToken`, calculated as the current claimable S value (factoring in the penalty).
    *   Users can burn their `vSToken` to withdraw S tokens (at the current claimable value, minus fees) or, optionally, withdraw the original fNFT (at fair value, to prevent arbitrage).
    *   The vault tracks the penalty curve and time elapsed for each fNFT to ensure accurate accounting.
*   **Data & Backend:**
    *   A subgraph (The Graph) to index all on-chain activities for fast and reliable data fetching.
    *   A Node.js backend to serve as a reliable API layer for the frontend.
*   **Frontend dApp:**
    *   Wallet connection (MetaMask, WalletConnect).
    *   A clear UI to view personal fNFTs and their current claimable value.
    *   A simple interface to deposit NFTs and receive vS tokens (showing penalty/discount).
    *   A dashboard to view `vSToken` balance, underlying claimable S, and penalty curve.

#### OUT OF SCOPE for MVP (Future Enhancements):
*   Complex governance or voting mechanisms.
*   Direct lending/borrowing against vS tokens.
*   Automated liquidation of underlying assets.
*   Protocol-managed fee structures beyond basic transaction/performance fees.

---

## 2. Detailed Technical Architecture

This architecture is broken down into four key layers: **On-Chain, Data, Backend, and Frontend.**

#### Layer 1: On-Chain (Solidity & Foundry)

This is the core logic and security foundation of the entire system.

1.  **`Vault.sol` (The Vault Contract)**
    *   **Standard:** Custom vault logic (not ERC-4626), tailored for penalty-based vesting.
    *   **Inherits:** `ERC721Holder.sol` (to safely receive NFTs), and `Ownable.sol` (for administrative control).
    *   **State Variables:**
        *   `address public immutable asset;` // The address of the fNFT contract.
        *   `address public immutable vSToken;` // The address of our ERC-20 vS Token.
        *   `mapping(uint256 => VestingSchedule) public vestingSchedules;` // Maps NFT ID to its specific vesting data.
        *   `mapping(uint256 => address) public nftOwners;` // Tracks the original depositor of each NFT.
        *   `mapping(uint256 => uint256) public depositTimestamps;` // Tracks when each NFT was deposited.
    *   **Core Functions:**
        *   `depositNFT(uint256 nftId)`:
            1.  User calls `approve()` on the fNFT contract first.
            2.  The function uses `safeTransferFrom()` to pull the fNFT into the vault.
            3.  It calculates the **current claimable S value** of the fNFT, using the penalty curve (see below). This is the basis for vS tokens to mint.
            4.  Calls `vSToken.mint()` to issue new vS tokens to the depositor.
            5.  Emits a `Deposit` event.
        *   `redeemVS(uint256 amount)`:
            1.  User returns vS tokens to the vault.
            2.  The vault calculates the current claimable S value (using the penalty curve and time elapsed).
            3.  Burns the vS tokens and releases the corresponding S tokens to the user, minus protocol fees.
            4.  Emits a `Redeem` event.
        *   `withdrawNFT(uint256 nftId)` (optional):
            1.  User can burn vS tokens to withdraw the original fNFT, but only at fair value (to prevent arbitrage).
            2.  The vault ensures the value of vS burned matches the current claimable value of the fNFT.
            3.  Emits a `WithdrawNFT` event.
        *   `claimUnlockedTokens()` (keeper/automated):
            1.  Calls the `claim()` function on each fNFT contract to receive the unlocked S tokens as the penalty decays.
            2.  These S tokens are now held by the Vault, backing the value of the vS tokens.
    *   **Penalty Curve Logic:**
        *   Let `t` = time since airdrop (in days), `T` = full vesting period (270 days), `P(t)` = penalty at time `t`:
        *   `P(t) = 1 - t/T`
        *   Claimable S at time `t`: `S_claimable(t) = S_total * (1 - P(t)) = S_total * t/T`
        *   All minting/redemption is based on this formula.

2.  **`vSToken.sol` (The Fungible Token)**
    *   **Standard:** ERC-20.
    *   **Inherits:** OpenZeppelin `ERC20.sol`, `Ownable.sol`.
    *   **Key Logic:**
        *   `mint(address to, uint256 amount)`: Only callable by the Vault.
        *   `burn(address from, uint256 amount)`: Only callable by the Vault.

#### Layer 2: Data Indexing (The Graph)

*   **Technology:** The Graph Protocol.
*   **`subgraph.yaml` (Manifest):**
    *   Defines the data sources (our `Vault.sol` contract address).
    *   Specifies which events to listen for: `Deposit`, `Redeem`, `WithdrawNFT`, and any updates to vesting.
*   **`schema.graphql` (Data Schema):**
    *   Defines the data structures (entities) we want to store and query.
    *   `User`: `id`, `vSTokenBalance`, `depositedNFTs`.
    *   `FNFT`: `id`, `vault`, `originalOwner`, `depositTimestamp`, `currentClaimableValue`.
    *   `Transaction`: `id`, `type (Deposit/Redeem/WithdrawNFT)`, `user`, `nftId`, `timestamp`.
*   **Mapping Handlers (AssemblyScript):**
    *   `handleDeposit(event)`: Creates/updates `User` and `FNFT` entities when a `Deposit` event is emitted.
    *   `handleRedeem(event)`: Updates entities when a `Redeem` event is emitted.
    *   `handleWithdrawNFT(event)`: Updates entities when a `WithdrawNFT` event is emitted.

#### Layer 3: Backend API (Node.js & Express)

*   **Technology:** Node.js, Express.js, Ethers.js.
*   **Purpose:**
    *   Provide simplified, aggregated data to the frontend.
    *   Cache non-critical data to reduce blockchain calls.
    *   Potentially handle keeper tasks (like calling `claimUnlockedTokens()`) in the future.
*   **API Endpoints:**
    *   `GET /api/user/:address`: Returns a consolidated view of a user's position, combining subgraph data (NFTs deposited) and direct contract calls (real-time vS balance, current claimable value).
    *   `GET /api/vault/stats`: Returns overall vault statistics like total NFTs deposited, total S claimed, etc.
    *   `GET /api/nfts/:address`: Fetches all fNFTs owned by a user's address from the Sonic chain to display which ones are available for deposit, including their current claimable value.

#### Layer 4: Frontend dApp (React.js)

*   **Technology:** React.js (or Next.js), Ethers.js, Wagmi, RainbowKit.
*   **Components:**
    *   `WalletConnector`: Connect wallet.
    *   `NFTGallery`: Displays the fNFTs a user owns, with current claimable value and penalty info.
    *   `DepositModal`: Shows estimated vS tokens to receive (with penalty/discount), and initiates deposit.
    *   `Dashboard`: Shows user's vS balance, underlying claimable S, and penalty curve.

---

## 3. Phased Implementation & Build Plan

We will build this project in **four sequential phases**.

#### Phase 1: Smart Contracts & Foundation (1-2 Weeks)
*   **Tasks:**
    1.  Set up a Foundry development environment.
    2.  Write the `vSToken.sol` contract with restricted `mint`/`burn` functions.
    3.  Write the `Vault.sol` contract implementing penalty-based vesting logic.
    4.  Write comprehensive unit tests for all functions (deposit, redeem, penalty edge cases).
    5.  Deploy both contracts to the Sonic testnet.
*   **Deliverable:** Deployed and verified contracts on a testnet explorer; full test suite passing.

#### Phase 2: Data Indexing & Backend Setup (1 Week)
*   **Tasks:**
    1.  Scaffold a new subgraph project.
    2.  Define the schema and manifest (`subgraph.yaml`, `schema.graphql`).
    3.  Write the mapping handlers to process contract events.
    4.  Deploy the subgraph to The Graph's hosted service.
    5.  Set up the Node.js/Express.js backend server.
    6.  Create the initial API endpoints to query the subgraph and the blockchain.
*   **Deliverable:** A deployed subgraph and a running backend API that serves user and vault data.

#### Phase 3: Frontend Development (2 Weeks)
*   **Tasks:**
    1.  Set up a React/Next.js project.
    2.  Integrate wallet connectivity using RainbowKit/Wagmi.
    3.  Build the `NFTGallery` to show a user's available fNFTs and their current claimable value.
    4.  Build the `DepositModal` and the `Dashboard` components.
    5.  Connect all frontend components to our backend API and directly to the blockchain for transaction signing.
*   **Deliverable:** A functional dApp where users can connect, view assets, and perform the full deposit workflow on the testnet.

#### Phase 4: Integration, Testing & Security Audit (1-2 Weeks)
*   **Tasks:**
    1.  Perform end-to-end testing of the entire system (Frontend -> Backend -> Contracts).
    2.  Integrate with a testnet AMM (e.g., Uniswap) to create a `vS`/`S` liquidity pool.
    3.  Freeze the contract code and submit it for an external security audit.
    4.  Prepare deployment scripts for mainnet.
*   **Deliverable:** A fully tested and integrated MVP on testnet; a completed security audit report.

---

## 4. Risk Management & Arbitrage Prevention

- **Penalty Curve Enforcement:** All minting and redemption is based on the current claimable S value, using the penalty curve. This prevents users from gaming the system by timing deposits/withdrawals.
- **Arbitrage Prevention:** If fNFT withdrawal is allowed, it is always at fair value (current claimable S), so users cannot exploit the protocol for risk-free profit.
- **Fee Structure:** Dynamic fees on redemption and performance can be used to incentivize liquidity and sustain the protocol.
- **Oracle/Valuation:** The protocol tracks the penalty curve and time elapsed for each fNFT, using robust on-chain logic.
- **Protocol Insolvency:** Conservative minting and reserve management ensure the protocol can always honor redemptions, even if many users redeem early.

---

## 5. Example User Journeys

- **Airdrop Recipient:** Alice receives a Sonic fNFT. She deposits it into the Vault and receives vS tokens, which she can trade or LP. Later, she redeems vS for S tokens as the penalty decays.
- **Speculator:** Bob buys vS tokens on an AMM, betting that S price will rise or that the discount will shrink as vesting progresses.
- **Liquidity Provider:** Carol LPs vS/S on an AMM, earning fees and possibly protocol incentives. 