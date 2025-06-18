## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

# vS Token MVP

## 🚀 Elevator Pitch
**vS Token** is a DeFi protocol that transforms illiquid, vesting NFTs (fNFTs) from Sonic airdrops into liquid, tradable ERC-20 tokens. By wrapping locked airdrop rewards in a secure vault, users can unlock liquidity, trade, and participate in DeFi while their original rewards vest.

---

## 🌍 The Full Idea

**Problem:**
- Many airdrop rewards (like Sonic's) are distributed as NFTs that vest over time, making them illiquid and untradeable until fully vested.

**Solution:**
- vS Token lets users deposit their vesting fNFTs into a smart contract vault and receive liquid vS tokens (ERC-20) in return.
- vS tokens can be traded, used in DeFi, or redeemed for the underlying rewards once vesting completes.
- This unlocks capital efficiency and composability for airdrop recipients, and creates new DeFi opportunities on Sonic.

**User Story:**
- Alice receives a Sonic airdrop as a vesting NFT (fNFT).
- She deposits her fNFT into the vS Vault and receives vS tokens.
- Alice can now trade, LP, or use vS tokens in DeFi, instead of waiting for her rewards to vest.
- When vesting is over, she can redeem her vS tokens for the original rewards.

---

## 🏗️ Technical Architecture

**On-Chain:**
- **Vault (ERC-4626):** Holds fNFTs, manages custody, and issues vS tokens as shares.
- **vS Token (ERC-20):** Liquid, tradable token representing claims on the vault's assets.
- **Mock contracts:** For local/testnet development and testing.

**Data Layer:**
- **The Graph subgraph:** Indexes vault events (deposits, withdrawals, user positions) for analytics and frontend.

**Backend:**
- **Node.js/Express API:** Serves vault data, user positions, and integrates with The Graph.

**Frontend:**
- **React + RainbowKit + wagmi:** Modern dApp with wallet connect, live vault stats, and deposit/withdraw UI.

---

## ✅ What's Built So Far
- **Smart contracts:** Vault (ERC-4626), vS Token (ERC-20), mocks. Fully tested and ready for mainnet.
- **Subgraph:** Scaffolded for event indexing, ready for deployment.
- **Backend:** Node.js API for vault data and user positions.
- **Frontend:** React dApp with wallet connect, live stats, and deposit/withdraw flows.
- **Deployment scripts:** Foundry scripts for easy deployment to Sonic mainnet or testnet.
- **Docs:** This README, plus in-code NatSpec and comments.

---

## 🏁 Quickstart

```sh
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

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
- See `/backend` for API and indexer scaffolding.

---

## 💻 Frontend (React)
- See `/frontend` for a modern dApp with wallet connect and live vault UI.

---

## 🔗 References
- [Sonic Labs Docs](https://docs.soniclabs.com/)
- [Sonic Mainnet Explorer](https://sonicscan.org)
