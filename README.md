# vS Vault: The Liquid Staking Protocol for Vesting NFTs

**vS Vault is a decentralized, battle-hardened DeFi protocol designed to unlock liquidity from vesting-locked tokens. Our V1 implementation targets Sonic's Season 1 airdrop, transforming illiquid fNFTs into `vS`, a fully-liquid, yield-bearing ERC-20 token.**

---

## The Core Problem & Our Solution

- **Problem:** Airdrops, like Sonic's, often lock the majority of tokens in long-term vesting schedules (e.g., 9-month fNFTs). This creates dead capital, frustrates users, and dampens ecosystem momentum.
- **Solution:** vS Vault provides a secure, on-chain mechanism for users to deposit their fNFTs and mint a 1:1 liquid equivalent, `vS`. This token can be freely traded, used as collateral, or staked in liquidity pools to earn fees and incentives, all while the underlying `S` tokens continue to vest.

## Protocol Philosophy: Decentralized & Battle-Hardened

This protocol is engineered for maximum security, transparency, and decentralization. There are no admin keys, no upgradeability in V1, and no single points of failure.

- **Immutable Contracts:** The core contracts (`vSVault.sol`, `vSToken.sol`) are built using OpenZeppelin standards and are non-upgradeable by design. What is deployed is final.
- **Public, Incentivized Automation:** The daily streaming of vested `S` tokens is not dependent on a centralized server. It's managed by a dual system:
    1.  **Primary Driver:** A decentralized keeper network (e.g., Chainlink Automation) ensures consistent, reliable execution.
    2.  **Public Backstop:** The `auto-stream` function includes a small gas incentive, making it profitable for anyone in the public to trigger it. This creates a permissionless, self-healing mechanism that guarantees liveness.
- **Transparent Data Layer:** All frontend data is served by a public, open-source Subgraph. The UI will explicitly state the freshness of the data, so users always know they are viewing verified, on-chain information.

## How It Works: The User Journey

1.  **Deposit:** A user sends their Sonic fNFT to the audited `vSVault` contract.
2.  **Mint:** The Vault instantly mints an equal amount of `vS` tokens to the user's wallet.
3.  **Utilize & Create Value:** The user now holds a fully-composable DeFi asset, ready to be deployed across the ecosystem to:
    - **Trade Instantly:** Swap `vS` for `S` or other assets on our partner DEX, **Shadow DEX**.
    - **Earn Deep Yield:** Provide liquidity to the incentivized `vS`/`S` pool to earn trading fees and rewards.
    - **Borrow Against Future Value:** Use `vS` as collateral on partner lending markets.
    This composability is the core of the **vS Flywheel**, turning locked assets into an engine for ecosystem-wide liquidity and growth.
4.  **Stream:** The Vault's `auto-stream` function is triggered daily, claiming all newly vested `S` from the entire pool of fNFTs and distributing it pro-rata to all `vS` holders.
5.  **Redeem:** At any time, a user can burn their `vS` to withdraw their proportional share of the underlying `S` tokens.

## Smart Contract Architecture

The entire system is comprised of three core, minimal contracts:

- **[vSVault.sol](https://github.com/b1rdmania/vs-token-mvp/blob/main/src/vSVault.sol):** An ERC-4626 compliant vault that securely holds all deposited fNFTs and manages all minting, streaming, and redemption logic.
- **[vSToken.sol](https://github.com/b1rdmania/vs-token-mvp/blob/main/src/vSToken.sol):** The liquid ERC-20 token that represents a 1:1 claim on the underlying `S` held within the vault.
- **[PenaltyCurveLib.sol](https://github.com/b1rdmania/vs-token-mvp/blob/main/src/PenaltyCurveLib.sol):** A placeholder library to handle any early-redemption logic that mirrors the fNFT's native penalty system.

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
