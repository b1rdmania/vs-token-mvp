# vS Vault: Technical Whitepaper
Version 1.1 – Last updated 20 Jun 2025

## 1. Why vS Vault Exists
Sonic's airdrop locks 75 % of rewards in 9-month vesting NFTs. Great for supply discipline, terrible for users who want to move capital. Most will dump their 25 % liquid slice and forget Sonic. vS Vault unlocks the locked share without breaking the vest schedule—turning dead capital into tradable, yield-bearing liquidity.

## 2. At-a-Glance
- Total fNFTs in Season-1: 90 M S
- User action: deposit fNFT → receive 1:1 vS tokens
- vS tokens: standard ERC-20, tradable, LP-able, lendable
- Underlying S continues vesting; unlocked S streams to vS holders daily

## 3. How the Flow Works
Deposit – user sends fNFT to the Vault contract
Mint – Vault mints equal vS balance to the user
Trade / LP – user swaps or LPs vS/S to earn fees
Stream – Vault auto-claims newly-unlocked S each day and distributes pro-rata to vS balances
Redeem – when vest hits 100 %, user burns vS to withdraw remaining S (early redemption allowed but pays the same penalty curve baked into the fNFT)

## 4. Smart-Contract Anatomy
### [vSVault.sol](https://github.com/b1rdmania/vs-token-mvp/blob/main/src/vSVault.sol)
- ERC-4626 compliant, owns all fNFTs
- Reads vesting schedule, tracks claimable S
- Auto-stream function anyone can trigger (gas refund)

### [vSToken.sol](https://github.com/b1rdmania/vs-token-mvp/blob/main/src/vSToken.sol)
- ERC-20 with EIP-2612 permits
- Mint / burn controlled by the Vault only

### [PenaltyCurveLib.sol](https://github.com/b1rdmania/vs-token-mvp/blob/main/src/PenaltyCurveLib.sol)
- Pure library replicating Sonic's linear burn formula for early exits

## 5. Technical Implementation Roadmap

### Phase 1: Testnet Deployment
**Objective:** Deploy fully functional vS Vault MVP on Sepolia testnet.
- Deploy `MockSonicNFT.sol` contract (public minting enabled).
- Complete core functions in `vSVault.sol` (deposit, mint, redeem).
- Deploy smart contracts to Sepolia testnet via Foundry.
- Update frontend configuration (Wagmi/RainbowKit) for Sepolia.
- Conduct comprehensive end-to-end testing.

### Phase 2: Decentralized Integration & Infrastructure
**Objective:** Integrate robust, decentralized protocol components.
- Implement Chainlink Automation for reward streaming.
- Deploy production-ready Subgraph on The Graph for decentralized indexing.
- Integrate Shadow AMM for liquidity provision and token swaps.
- Finalize frontend to source data exclusively from decentralized components.
- Complete internal testing and finalize user documentation.

### Phase 3: Security Hardening & Mainnet Readiness
**Objective:** Ensure rigorous security and prepare for mainnet launch.
- Initiate external security audit engagement with leading firm.
- Perform comprehensive internal security reviews using automated tools (Slither, Mythril).
- Prepare and validate mainnet deployment scripts.
- Establish initial liquidity seeding plan (250k S + 250k vS).
- Finalize launch strategy and documentation, pending audit results.

This roadmap ensures robust deployment, decentralization, security, and strategic readiness for mainnet launch.

## 6. Deep DeFi Composability & The Flywheel Effect
`vS` is more than a liquid token; it's a foundational building block for the Sonic ecosystem. By converting locked fNFTs into a standard, permissionless ERC-20, vS Vault unlocks immediate composability with other DeFi protocols.

- **Lending & Borrowing:** `vS` can be listed as collateral on lending markets, allowing users to borrow against their vesting assets without selling.
- **Yield Aggregation:** Vaults and yield aggregators can build strategies on top of the core `vS`/`S` liquidity pool.
- **The Flywheel Engine: The `vS`/`S` Pool:** The heart of this ecosystem will be a deeply liquid `vS`/`S` pool, launching on our strategic partner, **Shadow DEX**. A significant portion of protocol incentives will be directed to this pool, creating a powerful flywheel:
    1. High incentives attract LPs.
    2. Deep liquidity ensures a tight price peg and low slippage for traders.
    3. Reliable liquidity makes `vS` a trustworthy collateral asset across DeFi, driving more demand.
    4. Increased utility and demand for `vS` encourages more fNFT holders to deposit, further deepening liquidity.

This model transforms static, vesting assets into a dynamic engine for ecosystem-wide liquidity and growth.

- **Transparent Data via Subgraph:** All data for the user interface is indexed from on-chain events via a public Subgraph. This guarantees that what you see is a direct and verifiable reflection of on-chain reality.

## 8. Economic Impact for Sonic
- Deep vS/S liquidity absorbs airdrop sell pressure
- Locked capital becomes TVL, boosting headline metrics
- Continuous swap volume drives fee burn, aligning with S token economics
- More "things to do" on-chain keeps users active during the 9-month vest window

## 9. Get Involved
Seed liquidity, integrate vS in your dApp, or [review the code](https://github.com/b1rdmania/vs-token-mvp). 