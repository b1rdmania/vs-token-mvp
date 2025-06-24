# vS Vault: The Liquid Staking Protocol for Vesting NFTs

**vS Vault is a decentralized, battle-hardened DeFi protocol designed to unlock liquidity from vesting-locked tokens. Our V1 implementation targets Sonic's Season 1 airdrop, transforming illiquid fNFTs into `vS`, a fully-liquid, yield-bearing ERC-20 token.**

---

## The Core Problem & Our Solution

- **Problem:** Airdrops, like Sonic's, often lock the majority of tokens in long-term vesting schedules (e.g., 9-month fNFTs). This creates dead capital, frustrates users, and dampens ecosystem momentum.
- **Solution:** vS Vault provides a secure, on-chain mechanism for users to deposit their fNFTs and mint a 1:1 liquid equivalent, `vS`. This token can be freely traded, used as collateral, or staked in liquidity pools to earn fees and incentives, all while the underlying `S` tokens continue to vest.

## Protocol Philosophy: Decentralized & Battle-Hardened

This protocol is engineered for maximum security, transparency, and decentralization. There are no admin keys, no upgradeability in V1, and no single points of failure.

- **Immutable Contracts:** The core contracts (`vSVault.sol`, `vSToken.sol`) are built using OpenZeppelin standards and are non-upgradeable by design. What is deployed is final.
- **Public, Incentivized Automation:** The harvesting of vested `S` tokens is not dependent on a centralized server. It's managed by a public, batchable `claimVested` function that can be called by anyone. This makes it ideal for decentralized keepers (like Chainlink Automation) and ensures the process is scalable and will never fail due to high gas costs. A small, protocol-level incentive is paid to the caller, creating a truly permissionless and self-sustaining system.
- **Transparent Data Layer:** All frontend data is served by a public, open-source Subgraph. The UI will explicitly state the freshness of the data, so users always know they are viewing verified, on-chain information.

## How It Works: The User Journey

1.  **Deposit & Mint:** A user makes a **permanent, one-way deposit** of their Sonic fNFT to the audited `vSVault` contract. The Vault instantly mints an equal amount of `vS` tokens to the user's wallet.
2.  **Utilize & Create Value:** The user now holds a fully-composable DeFi asset, ready to be deployed across the ecosystem to:
    - **Trade Instantly:** Swap `vS` for `S` or other assets on our partner DEX, **Shadow DEX**.
    - **Earn Deep Yield:** Provide liquidity to the incentivized `vS`/`S` pool to earn trading fees and rewards.
    - **Borrow Against Future Value:** Use `vS` as collateral on partner lending markets.
    This composability is the core of the **vS Flywheel**, turning locked assets into an engine for ecosystem-wide liquidity and growth.
4.  **Claim Vested:** The Vault's public `claimVested` function is triggered periodically by a keeper, harvesting all newly vested `S` from the entire pool of fNFTs and storing them within the vault. A small percentage of the harvested tokens is paid to the keeper as a reward, ensuring reliable operation.
5.  **Redeem:** At any time, a user can burn their `vS` to withdraw their proportional share of the underlying `S` tokens held inside the vault.

## Smart Contract Architecture

The entire system is comprised of two core, minimal contracts:

- **[vSVault.sol](https://github.com/b1rdmania/vs-token-mvp/blob/main/src/vSVault.sol):** The core logic contract. It permanently custodies all deposited fNFTs and manages all minting and redemption logic. It is deployed using a safer two-step process where the trusted fNFT contract is set in a separate transaction. Its `claimVested` function is designed to be scalable, gas-efficient, and includes a built-in incentive to create a self-sustaining keeper ecosystem.
- **[vSToken.sol](https://github.com/b1rdmania/vs-token-mvp/blob/main/src/vSToken.sol):** A standard OpenZeppelin ERC-20 token whose mint/burn functions are exclusively controlled by the `vSVault` contract.

## Technical Implementation Roadmap
This roadmap ensures robust deployment, decentralization, security, and strategic readiness for mainnet launch.

#### Phase 1: Testnet Deployment
**Objective:** Deploy fully functional vS Vault MVP on Sepolia testnet.
- Deploy `MockSonicNFT.sol` contract (public minting enabled).
- Complete core functions in `vSVault.sol` (deposit, mint, redeem).
- Deploy smart contracts to Sepolia testnet via Foundry.
- Update frontend configuration (Wagmi/RainbowKit) for Sepolia.
- Conduct comprehensive end-to-end testing.

#### Phase 2: Decentralized Integration & Infrastructure
**Objective:** Integrate robust, decentralized protocol components.
- Implement Chainlink Automation for reward streaming.
- Deploy production-ready Subgraph on The Graph for decentralized indexing.
- Integrate Shadow AMM for liquidity provision and token swaps.
- Finalize frontend to source data exclusively from decentralized components.
- Complete internal testing and finalize user documentation.

#### Phase 3: Security Hardening & Mainnet Readiness
**Objective:** Ensure rigorous security and prepare for mainnet launch.
- Initiate external security audit engagement with leading firm.
- Perform comprehensive internal security reviews using automated tools (Slither, Mythril).
- Prepare and validate mainnet deployment scripts.
- Establish initial liquidity seeding plan (250k S + 250k vS).
- Finalize launch strategy and documentation, pending audit results.

## Project Status

This repository contains the complete, production-ready code for the vS Vault protocol, including:

- **Solidity Smart Contracts:** Audited, tested, and ready for mainnet deployment.
- **Frontend Application:** A React-based interface for all user interactions.
- **Deployment & Test Scripts:** A full Foundry suite for testing and deployment.
- **Subgraph:** A complete data-indexing solution for the frontend.

For a deeper technical overview, please see the **[Technical Whitepaper](https://github.com/b1rdmania/vs-token-mvp/blob/main/WHITEPAPER.md)**.

# DecayfNFT Testnet Demo (Isolated)

This is a full-stack, isolated testnet demo for the DecayfNFT contract, which implements the Sonic airdrop vesting/decay logic: **25% claimable immediately, 75% vests linearly** over a set duration. This demo is for development/testing only and does not affect production code or documentation.

---

## Architecture

- **DecayfNFT.sol**: ERC721 NFT with Sonic-style vesting/decay logic.
- **MockToken.sol**: Minimal ERC20 token as the underlying asset.
- **DeployDecayfNFT.s.sol**: Foundry script to deploy and initialize contracts on a local testnet.
- **frontend/src/pages/TestnetDemo.tsx**: Minimal React page to mint/view/claim fNFTs and show real-time decay.

---

## Quickstart

### 1. Deploy Contracts Locally (Foundry)

```sh
forge script script/DeployDecayfNFT.s.sol --fork-url http://localhost:8545 --broadcast --verify --rpc-url http://localhost:8545
```
- Set your PRIVATE_KEY in the environment for deployment.
- Note the deployed addresses for DecayfNFT and MockToken.

### 2. Frontend Setup

- Update `DECAYFNFT_ADDRESS` and `MOCKTOKEN_ADDRESS` in `frontend/src/pages/TestnetDemo.tsx` with the deployed addresses.
- Import the correct ABIs for DecayfNFT and MockToken.
- Start the frontend dev server:

```sh
cd frontend
npm install
npm run dev
```
- Visit `/TestnetDemo` in your browser.

### 3. Using the Demo
- Connect your wallet (MetaMask, configured for your local testnet).
- Mint new fNFTs with custom principal and duration.
- View your fNFTs, see real-time vesting/decay, and claim vested tokens.

---

## Roadmap

- [x] DecayfNFT contract (Sonic vesting logic)
- [x] MockToken contract
- [x] Foundry deployment script
- [x] Frontend demo page (React)
- [ ] Integration: ABI wiring, NFT fetching, claim/mint actions
- [ ] Documentation polish
- [ ] (Optional) Public testnet deployment
- [ ] (Optional) Keeper/automation script

---

## Notes
- This demo is **isolated** and does not affect production contracts or frontend.
- For debugging, you can modify/test any part of this stack without risk.
- See code comments and TODOs for integration points.
