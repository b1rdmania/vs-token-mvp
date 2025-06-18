# vS Token MVP: Detailed Project Timeline

## What's Changed (June 2025)
- **Major Update:** The protocol now models Sonic fNFT vesting as a penalty-based, non-linear curve (not linear unlock). All vS minting, redemption, and valuation logic is based on the current claimable S value, which increases as the penalty decays over time. All contract, backend, and frontend logic must reflect this. Tests and integration must cover penalty curve edge cases.
- **MVP Implementation Note:** The MVP will use the best-known Sonic penalty curve (linear decay over 9 months) for all contract, backend, subgraph, and frontend logic. This is based on public docs and community info as of June 2025. If the final Sonic contract differs, the logic will be updated accordingly. All layers will use this mock/assumed curve for now.
- **Testing & UI/UX Note:** The MVP will include comprehensive, edge-case, and fuzz testing for all contract logic (including penalty curve scenarios, event emission, and multi-user flows). The frontend will feature advanced UI/UX: user NFT gallery, claimable/penalty previews before deposit, redemption flows, and penalty curve visualization. The MVP will be demo-ready for partners and users, with clear disclaimers about the mock/assumed curve.

---

### **Phase 1: Smart Contracts & Foundation (Target: 1 Week)**

**Goal:** Build, test, and deploy the core on-chain logic to a testnet, using penalty-based vesting logic (linear decay over 9 months as currently known).

*   **Week 1: Core Contract Development**
    *   **Day 1: Project Setup & vS Token**
        *   [ ] Initialize Foundry project (or update existing).
        *   [ ] Create `vSToken.sol` (ERC-20, onlyVault mint/burn).
    *   **Day 2: Vault Contract Scaffolding**
        *   [ ] Create `Vault.sol` (custom, penalty-based logic).
        *   [ ] Inherit from `ERC721Holder` and `Ownable`.
        *   [ ] Define state variables (asset, vSToken, mappings, depositTimestamps).
        *   [ ] Write the constructor to set immutable variables.
    *   **Day 3: Vault Core Logic**
        *   [ ] Implement the `depositNFT` function (mints vS at current claimable S value, using penalty curve).
        *   [ ] Implement the `redeemVS` function (burns vS, releases S at current claimable value, minus fees).
        *   [ ] (Optional) Implement `withdrawNFT` at fair value.
        *   [ ] Write deployment scripts for both contracts.
    *   **Day 4: Unit & Edge-Case Testing**
        *   [ ] Write tests for vS minting/burning permissions.
        *   [ ] Write tests for Vault deposit/redeem using penalty curve.
        *   [ ] Write tests for penalty curve edge cases (start, halfway, full vest, early/late redemption, fNFT withdrawal, etc.).
        *   [ ] Assert correct event emission (claimable, penalty, etc.).
        *   [ ] Fuzz tests for multi-user, multi-NFT, and time-based scenarios.
    *   **Day 5: Testnet Deployment & Review**
        *   [ ] Deploy contracts to the Sonic testnet.
        *   [ ] Verify contracts on the testnet block explorer.
        *   [ ] Code review of the entire contract suite.

---

### **Phase 2: Data Indexing & Backend Setup (Target: 1 Week)**

**Goal:** Index on-chain data and build a reliable API layer, including penalty curve calculations (using the mock/assumed curve).

*   **Week 2: Data & API Layer**
    *   **Day 1: Subgraph Setup**
        *   [ ] Install The Graph CLI.
        *   [ ] Initialize a new subgraph project.
        *   [ ] Define the schema in `schema.graphql` (User, FNFT, Transaction, currentClaimableValue, penalty).
    *   **Day 2: Subgraph Mappings**
        *   [ ] Point `subgraph.yaml` to the deployed testnet contracts.
        *   [ ] Write AssemblyScript mapping logic for `handleDeposit`, `handleRedeem`, and `handleWithdrawNFT` (using the mock curve).
    *   **Day 3: Subgraph Deployment & Backend Init**
        *   [ ] Deploy the subgraph to The Graph's hosted service.
        *   [ ] Test queries in the Graph Explorer.
        *   [ ] Initialize Node.js/Express.js project.
        *   [ ] Install dependencies (`ethers`, `express`, `@apollo/client`).
    *   **Day 4: Backend API Development**
        *   [ ] Create the `/api/user/:address` endpoint (returns vS balance, claimable value, penalty info).
        *   [ ] Create the `/api/vault/stats` endpoint.
        *   [ ] Connect the backend to the subgraph and a testnet RPC.
    *   **Day 5: API Testing & Dockerization**
        *   [ ] Test all API endpoints for functionality and correctness, including penalty curve logic.
        *   [ ] (Optional) Create a Dockerfile for the backend service.
        *   [ ] Code review of the backend and subgraph.

---

### **Phase 3: Frontend Development (Target: 2 Weeks)**

**Goal:** Create a user-friendly dApp for interacting with the protocol, showing penalty/claimable value at all times (using the mock/assumed curve). Advanced UI/UX: user NFT gallery, claimable/penalty previews before deposit, redemption flows, penalty curve visualization, and demo-ready polish.

*   **Week 3: Core Frontend & Connectivity**
    *   **Day 1: Project Setup**
        *   [ ] Initialize React/Next.js project.
        *   [ ] Install `wagmi`, `ethers`, and `rainbowkit`.
    *   **Day 2: Wallet Integration**
        *   [ ] Configure Wagmi and RainbowKit providers.
        *   [ ] Build the `ConnectWallet` button and display user address/balance.
    *   **Day 3: User NFT Gallery**
        *   [ ] Build the UI component for the NFT gallery (vault and user NFTs).
        *   [ ] Connect to our backend's `/api/nfts/:address` endpoint to fetch and display NFTs, including current claimable value and penalty info.
    *   **Day 4: Dashboard UI**
        *   [ ] Build the UI for the main user dashboard.
        *   [ ] Display `vSToken` balance, claimable S, and penalty curve from the backend.
        *   [ ] Add penalty curve visualization (progress bar or chart).
    *   **Day 5: State Management & Review**
        *   [ ] Set up a global state solution (e.g., Zustand, Redux Toolkit).
        *   [ ] Refactor components to use the global state.
        *   [ ] Code review of the week's progress.

*   **Week 4: Transactional UI & Integration**
    *   **Day 1-2: Deposit Flow**
        *   [ ] Build the `DepositModal` component.
        *   [ ] Wire up the "Approve" transaction logic for the fNFT contract.
        *   [ ] Wire up the "Deposit" transaction logic for the `Vault` contract (showing penalty/discount and vS preview).
    *   **Day 3: Redemption/Withdrawal Flow**
        *   [ ] Build the UI for the redemption process.
        *   [ ] Wire up the "Burn" transaction logic to redeem S or withdraw an NFT at fair value.
        *   [ ] Show claimable/penalty preview before redeem/withdraw.
    *   **Day 4: End-to-End Testing & Demo Polish**
        *   [ ] Perform a full user flow test: Connect -> View NFTs (with penalty info) -> Deposit -> See Dashboard Update -> Redeem/Withdraw.
        *   [ ] Fix bugs and UI inconsistencies.
        *   [ ] Add clear disclaimer about mock/assumed curve.
    *   **Day 5: Final Polish & Review**
        *   [ ] Add loading states, error handling, and transaction notifications.
        *   [ ] Final code review of the entire frontend application.

---

### **Phase 4: Final Integration, Audit & Launch Prep (Target: 1-2 Weeks)**

**Goal:** Ensure the system is secure, fully tested, and ready for launch, with all penalty logic covered (using the mock/assumed curve, to be updated if needed).

*   **Week 5: Audit & AMM Integration**
    *   **Day 1: Code Freeze & Audit Submission**
        *   [ ] Final check-in of all contract code.
        *   [ ] Tag the release in Git.
        *   [ ] Submit the contracts to a third-party security auditor.
    *   **Day 2-3: AMM Liquidity Pool**
        *   [ ] Create a `vS`/`S` (or stablecoin) liquidity pool on a testnet DEX (e.g., Uniswap).
        *   [ ] Document the process for providing initial liquidity.
    *   **Day 4-5: Final Documentation & Prep**
        *   [ ] Write user-facing documentation and tutorials (explain penalty curve, claimable value, and risks).
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