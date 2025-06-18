# vS Token MVP

## What's Changed (June 2025)
- **Major Update:** The protocol now models Sonic fNFT vesting as a penalty-based, non-linear curve (not linear unlock). All vS minting, redemption, and valuation logic is based on the current claimable S value, which increases as the penalty decays over time. This prevents arbitrage and ensures fair value for all users. All code, UI, and docs have been updated accordingly.

---

## 🚀 Elevator Pitch
**vS Token** is a DeFi protocol that transforms illiquid, vesting NFTs (fNFTs) from Sonic airdrops into liquid, tradable ERC-20 tokens. By wrapping locked airdrop rewards in a secure vault, users can unlock liquidity, trade, and participate in DeFi while their original rewards vest. **All vS minting and redemption is based on the current claimable S value, using the Sonic penalty curve.**

---

## 🌍 The Full Idea

**Problem:**
- Many airdrop rewards (like Sonic's) are distributed as NFTs that vest with a penalty-based, non-linear curve. You can claim at any time, but the amount of S you receive is subject to a penalty that decays linearly over 9 months. This makes them illiquid and hard to price.

**Solution:**
- vS Token lets users deposit their vesting fNFTs into a smart contract vault and receive liquid vS tokens (ERC-20) in return.
- The amount of vS minted is based on the current claimable S value, factoring in the penalty curve.
- vS tokens can be traded, used in DeFi, or redeemed for the underlying S tokens at any time (at the current claimable value, minus fees).
- This unlocks capital efficiency and composability for airdrop recipients, and creates new DeFi opportunities on Sonic.

**User Story:**
- Alice receives a Sonic airdrop as a vesting NFT (fNFT).
- She deposits her fNFT into the vS Vault and receives vS tokens, calculated at the current claimable S value (using the penalty curve).
- Alice can now trade, LP, or use vS tokens in DeFi, instead of waiting for her rewards to vest.
- When she wants to redeem, she can burn her vS tokens for S tokens at the current claimable value, or (optionally) withdraw the fNFT at fair value.

---

## 🏗️ Technical Architecture

**On-Chain:**
- **Vault (Custom, Penalty-Based):** Holds fNFTs, manages custody, and issues vS tokens as discounted claims on S, using the penalty curve for all calculations.
- **vS Token (ERC-20):** Liquid, tradable token representing claims on the vault's assets, minted/burned only by the vault.
- **Mock contracts:** For local/testnet development and testing.

**Data Layer:**
- **The Graph subgraph:** Indexes vault events (deposits, redemptions, user positions, penalty curve) for analytics and frontend.

**Backend:**
- **Node.js/Express API:** Serves vault data, user positions, and integrates with The Graph, including penalty/claimable value calculations.

**Frontend:**
- **React + RainbowKit + wagmi:** Modern dApp with wallet connect, live vault stats, penalty curve display, and deposit/redeem UI.

---

## ✅ What's Built So Far
- **Smart contracts:** Vault (penalty-based), vS Token (ERC-20), mocks. Fully tested and ready for mainnet.
- **Subgraph:** Scaffolded for event indexing, ready for deployment.
- **Backend:** Node.js API for vault data and user positions, including penalty logic.
- **Frontend:** React dApp with wallet connect, live stats, penalty curve, and deposit/redeem flows.
- **Deployment scripts:** Scripts for easy deployment to Sonic mainnet or testnet.
- **Docs:** This README, plus in-code NatSpec and comments.

---

## 🏁 Quickstart

```sh
# Install dependencies
forge install

# Run tests
forge test

# Deploy (set PRIVATE_KEY and use Sonic RPC)
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY
forge script script/Deploy.s.sol --rpc-url https://rpc.soniclabs.com --broadcast --chain-id 146 --private-key $PRIVATE_KEY
```

---

## 📊 The Graph (Subgraph)
- To run locally:
```sh
npm install -g @graphprotocol/graph-cli
graph codegen
graph build
graph create --node http://localhost:8020 vs-token-mvp
graph deploy --node http://localhost:8020 --ipfs http://localhost:5001 vs-token-mvp
```
- Edit `subgraph.yaml` and `schema.graphql` as needed.

---

## 🖥️ Backend (Node.js)
- See `/backend` for API and indexer scaffolding (includes penalty curve logic).

---

## 💻 Frontend (React)
- See `/frontend` for a modern dApp with wallet connect, penalty curve display, and live vault UI.

---

## ⚠️ Risk Management & Arbitrage Prevention
- All minting and redemption is based on the current claimable S value, using the penalty curve. This prevents users from gaming the system by timing deposits/withdrawals.
- If fNFT withdrawal is allowed, it is always at fair value (current claimable S), so users cannot exploit the protocol for risk-free profit.
- Dynamic fees on redemption and performance can be used to incentivize liquidity and sustain the protocol.
- The protocol tracks the penalty curve and time elapsed for each fNFT, using robust on-chain logic.
- Conservative minting and reserve management ensure the protocol can always honor redemptions, even if many users redeem early.

---

## 🔗 References
- [Sonic Labs Docs](https://docs.soniclabs.com/)
- [Sonic Mainnet Explorer](https://sonicscan.org)
