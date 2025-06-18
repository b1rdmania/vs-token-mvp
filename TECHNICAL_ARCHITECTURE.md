# vS Token MVP: Technical Architecture & Phased Implementation Plan

## 1. Scope of Work & MVP Definition

The goal of the MVP is to create a fully functional, secure, and user-friendly platform for converting locked fNFTs into liquid vS tokens.

#### IN SCOPE for MVP:
*   **Smart Contracts:**
    *   An ERC-4626 compliant vault for fNFT deposits and withdrawals.
    *   An ERC-20 token (`vSToken`) representing a share of the vault.
*   **Core Functionality:**
    *   Users can deposit their vesting fNFTs into the vault.
    *   Upon deposit, users receive a corresponding amount of `vSToken`.
    *   Users can burn their `vSToken` to withdraw their original fNFT (if it hasn't been liquidated or used in other ways).
    *   A mechanism for the vault to claim unlocked `$S` tokens from the underlying fNFTs.
*   **Data & Backend:**
    *   A subgraph (The Graph) to index all on-chain activities for fast and reliable data fetching.
    *   A Node.js backend to serve as a reliable API layer for the frontend.
*   **Frontend dApp:**
    *   Wallet connection (MetaMask, WalletConnect).
    *   A clear UI to view personal fNFTs.
    *   A simple interface to deposit NFTs and receive vS tokens.
    *   A dashboard to view `vSToken` balance and the underlying assets.

#### OUT OF SCOPE for MVP (Future Enhancements):
*   Complex governance or voting mechanisms.
*   Direct lending/borrowing against vS tokens.
*   Automated liquidation of underlying assets.
*   Protocol-managed fee structures beyond basic transaction fees.

---

## 2. Detailed Technical Architecture

This architecture is broken down into four key layers: **On-Chain, Data, Backend, and Frontend.**

#### Layer 1: On-Chain (Solidity & Hardhat)

This is the core logic and security foundation of the entire system.

1.  **`Vault.sol` (The Vault Contract)**
    *   **Standard:** ERC-4626. This provides a standardized API for a tokenized vault.
    *   **Inherits:** OpenZeppelin `ERC4626.sol`, `ERC721Holder.sol` (to safely receive NFTs), and `Ownable.sol` (for administrative control).
    *   **State Variables:**
        *   `address public immutable asset;` // The address of the fNFT contract.
        *   `address public immutable vSToken;` // The address of our ERC-20 vS Token.
        *   `mapping(uint256 => VestingSchedule) public vestingSchedules;` // Maps NFT ID to its specific vesting data.
        *   `mapping(uint256 => address) public nftOwners;` // Tracks the original depositor of each NFT.
    *   **Core Functions:**
        *   `depositNFT(uint256 nftId)`:
            1.  User calls `approve()` on the fNFT contract first.
            2.  The function uses `safeTransferFrom()` to pull the fNFT into the vault.
            3.  It calculates the amount of underlying `$S` tokens locked in the fNFT. This will be the basis for `shares` to mint.
            4.  Calls `vSToken.mint()` to issue new vS tokens to the depositor.
            5.  Emits a `Deposit` event.
        *   `withdrawNFT(uint256 nftId)`:
            1.  User calls this function, which requires them to hold enough vS tokens.
            2.  The function calculates the required `vSToken` to burn for the withdrawal.
            3.  Calls `vSToken.burn()` to destroy the user's vS tokens.
            4.  Uses `safeTransferFrom()` to return the fNFT to the user.
            5.  Emits a `Withdraw` event.
        *   `claimUnlockedTokens()`: (Permissioned, likely `onlyOwner` or automated via a keeper)
            1.  Iterates through all deposited NFTs.
            2.  Calls the `claim()` function on each fNFT contract to receive the unlocked `$S` tokens.
            3.  These `$S` tokens are now held by the Vault, backing the value of the vS tokens.

2.  **`vSToken.sol` (The Fungible Token)**
    *   **Standard:** ERC-20.
    *   **Inherits:** OpenZeppelin `ERC20.sol`, `Ownable.sol`.
    *   **Key Logic:**
        *   `mint(address to, uint256 amount)`: This function will have a custom modifier, `onlyVault`, ensuring only the `Vault.sol` contract can mint new tokens.
        *   `burn(address from, uint256 amount)`: Similarly, this will be restricted so burning is only initiated through the vault's withdrawal process.

#### Layer 2: Data Indexing (The Graph)

This layer provides a fast, organized, and queryable data source for our frontend.

*   **Technology:** The Graph Protocol.
*   **`subgraph.yaml` (Manifest):**
    *   Defines the data sources (our `Vault.sol` contract address).
    *   Specifies which events to listen for: `Deposit`, `Withdraw`, and any updates to vesting.
*   **`schema.graphql` (Data Schema):**
    *   Defines the data structures (entities) we want to store and query.
    *   `User`: `id`, `vSTokenBalance`, `depositedNFTs`.
    *   `FNFT`: `id`, `vault`, `originalOwner`, `depositTimestamp`.
    *   `Transaction`: `id`, `type (Deposit/Withdraw)`, `user`, `nftId`, `timestamp`.
*   **Mapping Handlers (AssemblyScript):**
    *   `handleDeposit(event)`: Creates/updates `User` and `FNFT` entities when a `Deposit` event is emitted.
    *   `handleWithdraw(event)`: Updates entities when a `Withdraw` event is emitted.

#### Layer 3: Backend API (Node.js & Express)

This API serves as a secure and efficient intermediary between the frontend and the blockchain/subgraph.

*   **Technology:** Node.js, Express.js, Ethers.js.
*   **Purpose:**
    *   Provide simplified, aggregated data to the frontend.
    *   Cache non-critical data to reduce blockchain calls.
    *   Potentially handle keeper tasks (like calling `claimUnlockedTokens()`) in the future.
*   **API Endpoints:**
    *   `GET /api/user/:address`: Returns a consolidated view of a user's position, combining subgraph data (NFTs deposited) and direct contract calls (real-time vS balance).
    *   `GET /api/vault/stats`: Returns overall vault statistics like total NFTs deposited, total `$S` claimed, etc.
    *   `GET /api/nfts/:address`: Fetches all fNFTs owned by a user's address from the Sonic chain to display which ones are available for deposit.

#### Layer 4: Frontend dApp (React.js)

The user-facing application. It will be clean, intuitive, and focused on the core actions.

*   **Technology:** React.js (or Next.js), Ethers.js, Wagmi (for React hooks), and RainbowKit (for wallet connections).
*   **Components:**
    *   `WalletConnector`: A button/modal to connect using MetaMask or WalletConnect via RainbowKit.
    *   `NFTGallery`: Displays the fNFTs a user owns (fetched via our `/api/nfts/:address` endpoint).
    *   `DepositModal`: A component that allows a user to select an NFT, see the estimated vS tokens they will receive, and initiate the `approve` and `depositNFT` transactions.
    *   `Dashboard`: The main view showing the user's `vSToken` balance, its approximate value, and a list of their deposited NFTs.

---

## 3. Phased Implementation & Build Plan

We will build this project in **four sequential phases**.

#### Phase 1: Smart Contracts & Foundation (1-2 Weeks)
The goal is to get the core on-chain logic built, tested, and deployed to a testnet.
*   **Tasks:**
    1.  Set up a Hardhat development environment.
    2.  Write the `vSToken.sol` contract with restricted `mint`/`burn` functions.
    3.  Write the `Vault.sol` contract implementing the ERC-4626 standard and NFT-specific logic.
    4.  Write comprehensive unit tests for all functions (deposit, withdraw, edge cases).
    5.  Deploy both contracts to the Sonic testnet.
*   **Deliverable:** Deployed and verified contracts on a testnet explorer; full test suite passing.

#### Phase 2: Data Indexing & Backend Setup (1 Week)
With contracts live on a testnet, we can now index their data and build our API.
*   **Tasks:**
    1.  Scaffold a new subgraph project.
    2.  Define the schema and manifest (`subgraph.yaml`, `schema.graphql`).
    3.  Write the mapping handlers to process contract events.
    4.  Deploy the subgraph to The Graph's hosted service.
    5.  Set up the Node.js/Express.js backend server.
    6.  Create the initial API endpoints to query the subgraph and the blockchain.
*   **Deliverable:** A deployed subgraph and a running backend API that serves user and vault data.

#### Phase 3: Frontend Development (2 Weeks)
Now we build the user interface that ties everything together.
*   **Tasks:**
    1.  Set up a React/Next.js project.
    2.  Integrate wallet connectivity using RainbowKit/Wagmi.
    3.  Build the `NFTGallery` to show a user's available fNFTs.
    4.  Build the `DepositModal` and the `Dashboard` components.
    5.  Connect all frontend components to our backend API and directly to the blockchain for transaction signing.
*   **Deliverable:** A functional dApp where users can connect, view assets, and perform the full deposit workflow on the testnet.

#### Phase 4: Integration, Testing & Security Audit (1-2 Weeks)
The final phase before mainnet launch.
*   **Tasks:**
    1.  Perform end-to-end testing of the entire system (Frontend -> Backend -> Contracts).
    2.  Integrate with a testnet AMM (e.g., Uniswap) to create a `vS`/`$S` liquidity pool.
    3.  Freeze the contract code and submit it for an external security audit.
    4.  Prepare deployment scripts for mainnet.
*   **Deliverable:** A fully tested and integrated MVP on testnet; a completed security audit report. 