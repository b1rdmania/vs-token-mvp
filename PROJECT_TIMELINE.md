# vS Token MVP: Detailed Project Timeline

This document breaks down the 4-phase development plan into a weekly and daily schedule.

---

### **Phase 1: Smart Contracts & Foundation (Target: 1 Week)**

**Goal:** Build, test, and deploy the core on-chain logic to a testnet.

*   **Week 1: Core Contract Development**
    *   **Day 1: Project Setup & vS Token**
        *   [ ] Initialize Hardhat project (`npx hardhat init`).
        *   [ ] Install OpenZeppelin contracts (`npm install @openzeppelin/contracts`).
        *   [ ] Create `vSToken.sol` (ERC-20).
        *   [ ] Add `onlyVault` modifier and placeholder `mint`/`burn` functions.
    *   **Day 2: Vault Contract Scaffolding**
        *   [ ] Create `Vault.sol` (ERC-4626).
        *   [ ] Inherit from `ERC4626` and `ERC721Holder`.
        *   [ ] Define state variables (asset, vSToken, mappings).
        *   [ ] Write the constructor to set immutable variables.
    *   **Day 3: Vault Core Logic**
        *   [ ] Implement the `depositNFT` function logic.
        *   [ ] Implement the `withdrawNFT` function logic.
        *   [ ] Write deployment scripts for both contracts.
    *   **Day 4: Unit Testing**
        *   [ ] Write tests for `vSToken` minting and burning permissions.
        *   [ ] Write tests for `Vault` deposit and withdraw success cases.
        *   [ ] Write tests for failure cases (e.g., withdrawing without enough shares).
    *   **Day 5: Testnet Deployment & Review**
        *   [ ] Deploy contracts to the Sonic testnet.
        *   [ ] Verify contracts on the testnet block explorer.
        *   [ ] Code review of the entire contract suite.

---

### **Phase 2: Data Indexing & Backend Setup (Target: 1 Week)**

**Goal:** Index on-chain data and build a reliable API layer.

*   **Week 2: Data & API Layer**
    *   **Day 1: Subgraph Setup**
        *   [ ] Install The Graph CLI.
        *   [ ] Initialize a new subgraph project.
        *   [ ] Define the schema in `schema.graphql` (User, FNFT, Transaction).
    *   **Day 2: Subgraph Mappings**
        *   [ ] Point `subgraph.yaml` to the deployed testnet contracts.
        *   [ ] Write AssemblyScript mapping logic for `handleDeposit` and `handleWithdraw`.
    *   **Day 3: Subgraph Deployment & Backend Init**
        *   [ ] Deploy the subgraph to The Graph's hosted service.
        *   [ ] Test queries in the Graph Explorer.
        *   [ ] Initialize Node.js/Express.js project.
        *   [ ] Install dependencies (`ethers`, `express`, `@apollo/client`).
    *   **Day 4: Backend API Development**
        *   [ ] Create the `/api/user/:address` endpoint.
        *   [ ] Create the `/api/vault/stats` endpoint.
        *   [ ] Connect the backend to the subgraph and a testnet RPC.
    *   **Day 5: API Testing & Dockerization**
        *   [ ] Test all API endpoints for functionality and correctness.
        *   [ ] (Optional) Create a Dockerfile for the backend service.
        *   [ ] Code review of the backend and subgraph.

---

### **Phase 3: Frontend Development (Target: 2 Weeks)**

**Goal:** Create a user-friendly dApp for interacting with the protocol.

*   **Week 3: Core Frontend & Connectivity**
    *   **Day 1: Project Setup**
        *   [ ] Initialize React/Next.js project (`npx create-next-app`).
        *   [ ] Install `wagmi`, `ethers`, and `rainbowkit`.
    *   **Day 2: Wallet Integration**
        *   [ ] Configure Wagmi and RainbowKit providers.
        *   [ ] Build the `ConnectWallet` button and display user address/balance.
    *   **Day 3: User NFT Gallery**
        *   [ ] Build the UI component for the NFT gallery.
        *   [ ] Connect to our backend's `/api/nfts/:address` endpoint to fetch and display NFTs.
    *   **Day 4: Dashboard UI**
        *   [ ] Build the UI for the main user dashboard.
        *   [ ] Display `vSToken` balance and other key stats from the backend.
    *   **Day 5: State Management & Review**
        *   [ ] Set up a global state solution (e.g., Zustand, Redux Toolkit).
        *   [ ] Refactor components to use the global state.
        *   [ ] Code review of the week's progress.

*   **Week 4: Transactional UI & Integration**
    *   **Day 1-2: Deposit Flow**
        *   [ ] Build the `DepositModal` component.
        *   [ ] Wire up the "Approve" transaction logic for the fNFT contract.
        *   [ ] Wire up the "Deposit" transaction logic for the `Vault` contract.
    *   **Day 3: Withdrawal Flow**
        *   [ ] Build the UI for the withdrawal process.
        *   [ ] Wire up the "Burn" transaction logic to withdraw an NFT.
    *   **Day 4: End-to-End Testing**
        *   [ ] Perform a full user flow test: Connect -> View NFTs -> Deposit -> See Dashboard Update -> Withdraw.
        *   [ ] Fix bugs and UI inconsistencies.
    *   **Day 5: Final Polish & Review**
        *   [ ] Add loading states, error handling, and transaction notifications.
        *   [ ] Final code review of the entire frontend application.

---

### **Phase 4: Final Integration, Audit & Launch Prep (Target: 1-2 Weeks)**

**Goal:** Ensure the system is secure, fully tested, and ready for launch.

*   **Week 5: Audit & AMM Integration**
    *   **Day 1: Code Freeze & Audit Submission**
        *   [ ] Final check-in of all contract code.
        *   [ ] Tag the release in Git.
        *   [ ] Submit the contracts to a third-party security auditor.
    *   **Day 2-3: AMM Liquidity Pool**
        *   [ ] Create a `vS`/`$S` (or stablecoin) liquidity pool on a testnet DEX (e.g., Uniswap).
        *   [ ] Document the process for providing initial liquidity.
    *   **Day 4-5: Final Documentation & Prep**
        *   [ ] Write user-facing documentation and tutorials.
        *   [ ] Prepare mainnet deployment scripts and environment variables.
        *   [ ] Wait for audit feedback.

*   **Week 6 (Contingent on Audit):**
    *   **Days 1-3: Implement Audit Fixes**
        *   [ ] Address any issues or recommendations from the security audit.
        *   [ ] Have the auditors review the fixes.
    *   **Day 4: Mainnet Deployment**
        *   [ ] Deploy contracts to mainnet.
        *   [ ] Deploy backend and frontend to production servers.
    *   **Day 5: Launch**
        *   [ ] Provide initial liquidity to the AMM pool.
        *   [ ] Announce the launch to the community. 