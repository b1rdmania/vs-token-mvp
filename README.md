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

## Quickstart

```sh
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Install dependencies
forge install

# Run tests
forge test

# Deploy locally (anvil must be running)
forge script script/Deploy.s.sol --fork-url http://localhost:8545 --broadcast
```

## Deployment (Testnet)

1. Copy `.env.example` to `.env` and fill in your private key and RPC URL.
2. Deploy:
```sh
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

## Contract Addresses
- Will be printed to console after deployment.

## Environment Variables
- `PRIVATE_KEY` - your deployer wallet private key
- `SEPOLIA_RPC_URL` - your testnet RPC endpoint

## Project Structure
- `src/` - Solidity contracts
- `test/` - Foundry tests
- `script/` - Deployment scripts
- `lib/` - Dependencies (OpenZeppelin, etc)
- `out/` - Build artifacts

## The Graph (Subgraph)
- To run locally:
```sh
npm install -g @graphprotocol/graph-cli
# Generate types
graph codegen
# Build
graph build
# Deploy (local node)
graph create --node http://localhost:8020 vs-token-mvp
graph deploy --node http://localhost:8020 --ipfs http://localhost:5001 vs-token-mvp
```
- Edit `subgraph.yaml` and `schema.graphql` as needed.

## Backend (Node.js)
- To be added: `/backend` directory with API and indexer
