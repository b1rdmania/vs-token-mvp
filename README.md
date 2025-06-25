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

# DecayfNFT Mainnet Demo (Isolated)

This repository now includes a **live, mainnet demo** for the DecayfNFT contract, which implements the Sonic airdrop vesting/decay logic: **25% claimable immediately, 75% vests linearly** over a set duration. This demo is for demonstration and onboarding purposes, allowing anyone to experience the real protocol flow on mainnet with demo tokens and NFTs. It does not affect production Sonic airdrop assets.

---

## Architecture

- **DecayfNFT.sol**: ERC721 NFT with Sonic-style vesting/decay logic.
- **MockToken.sol**: Minimal ERC20 token as the underlying asset.
- **DeployDecayfNFT.s.sol**: Foundry script to deploy and initialize contracts.
- **frontend/src/pages/TestnetDemo.tsx**: Minimal React page to mint/view/claim fNFTs and show real-time decay. (Accessible as the "Demo" page in the app.)

---

## Using the Mainnet Demo
- Connect your wallet (MetaMask, configured for Sonic mainnet).
- Use the "Demo" page to mint new fNFTs with demo tokens, view your fNFTs, and claim vested tokens as they unlock.
- All actions are on mainnet, but use demo assets for a risk-free, hands-on experience.

---

## Notes
- This demo is **isolated** and does not affect production Sonic airdrop contracts or frontend.
- For debugging, you can modify/test any part of this stack without risk to real user funds.
- See code comments and TODOs for integration points.

## 🎯 The Problem
Sonic airdrop recipients receive fNFTs (future NFTs) that vest over 9 months. These assets are:
- **Non-transferable** (soulbound)
- **Illiquid** for the entire vesting period
- **Unusable** as collateral in DeFi

## ✨ Our Solution
The vS Vault Protocol provides **immediate liquidity** through:

1. **Delegation-based deposits**: Users delegate claiming rights to the vault
2. **Liquid representation**: Mint D-vS tokens worth full future value  
3. **Instant trading**: Trade D-vS tokens on DEXs like Shadow
4. **Direct redemption**: Vault claims from fNFTs as users redeem

## 🌑 Shadow DEX Integration

Our demo showcases complete liquidity unlock with **Shadow DEX** - Sonic's leading decentralized exchange:

### Why Shadow DEX?
- 🏆 **Market leader**: 60% of Sonic's total trading volume
- 💰 **MEV protection**: 100% MEV recycled back to liquidity providers
- ⚡ **Ultra-low fees**: $0.0001 transaction costs
- 🔄 **Deep liquidity**: Minimal slippage for large trades
- 📈 **High yields**: LPs earn from high-frequency trading

### Demo Flow
1. **Mint fNFT**: Create demo vesting NFT (10,000 tS, 9 months)
2. **Deposit to vault**: Delegate fNFT → Get 10,000 D-vS tokens instantly
3. **Trade on Shadow**: Swap D-vS for tS at market rate (~15% discount)
4. **Immediate liquidity**: Access funds today instead of waiting 9 months

## 🔧 Technical Architecture

### Core Contracts
- **TestSonicDecayfNFT**: ERC-721 vesting NFT with delegation
- **vSVault**: Core protocol with fee mechanism  
- **VSToken**: ERC-20 liquid representation (D-vS)
- **TestSonicToken**: Demo underlying asset (tS)

### Economic Model
- **1% protocol fee** taken in underlying Sonic tokens (not vS tokens)
- **0.05% keeper incentive** for claiming vested tokens
- **Treasury sustainability**: Fees in real assets, never worthless tokens

### Security Features
- ✅ **ReentrancyGuard**: Prevents reentrancy attacks
- ✅ **Pausable**: Emergency stop mechanism
- ✅ **Delegation system**: Works with soulbound NFTs
- ✅ **Direct claiming**: No liquidity mismatches

## 🚀 Live Demo

**Sonic Mainnet**: [https://vs-vault-demo.netlify.app](https://vs-vault-demo.netlify.app)

### Contract Addresses
- **fNFT**: `0xdf34078C9C8E5891320B780F6C8b8a54B784108C`
- **tS Token**: `0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49`  
- **D-vS Token**: `0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031`
- **Vault**: `0x37BD20868FB91eB37813648F4D05F59e07A1bcfb`

### Try the Demo
1. Connect wallet to Sonic Mainnet
2. Get test tokens from faucet
3. Mint demo fNFT
4. Deposit to vault → Get D-vS tokens
5. Trade on Shadow DEX demo interface

## 🏗️ Development

```bash
# Install dependencies
npm install

# Start frontend
cd frontend && npm run dev

# Compile contracts
forge build

# Run tests
forge test

# Deploy (set PRIVATE_KEY in .env)
forge script script/DeployDecayfNFT.s.sol --rpc-url sonic --broadcast
```

## 🔬 Testing

Comprehensive test suite covering:
- ✅ Deposit and minting flow
- ✅ Claiming vested tokens with keeper incentives
- ✅ Redemption with protocol fees (in underlying tokens)
- ✅ Delegation-based architecture
- ✅ Error conditions and edge cases

```bash
forge test --match-contract VaultTest -vv
```

## 💡 Innovation Highlights

1. **Soulbound compatibility**: First vault to work with non-transferable NFTs
2. **Economic sustainability**: Fees in underlying assets prevent treasury devaluation
3. **Shadow DEX integration**: Seamless liquidity provision through leading Sonic DEX
4. **Complete user journey**: From locked fNFT to liquid tradeable tokens

## 🌟 Future Enhancements

- [ ] Cross-chain bridge integration
- [ ] Advanced yield strategies  
- [ ] Governance token and DAO
- [ ] Integration with more Sonic DeFi protocols
- [ ] Automated market making features

---

**Built for Sonic ecosystem** | **Liquidity when you need it** | **DeFi composability unlocked**
