# vS Vault – Turn locked Sonic fNFTs into liquid DeFi collateral

⚠️ **Immutable mainnet contracts. Test thoroughly before depositing real fNFTs.**

⚠️ **Immutable. Zero admin keys. Four external functions.**  
**Once deployed, nobody (including us) can change or pause the vault.**

## Why Use vS

- **Unlock liquidity today** without burning away 75% of your airdrop
- **DeFi composability** – trade, LP, borrow, farm with vS (standard ERC-20)
- **Vault absorbs the waiting cost**; you stay liquid
- **1:1 redeem for S** after maturity via on-chain `redeem()` function
- **No admin keys, no upgrades, no governance**
- **Protocol-owned liquidity** jump-starts the pool; yield from swap fees + natural price convergence

## How It Works

1. **Deposit fNFT** → mints 1000 vS (1 vS per 1 S face value)  
   *(Vault holds the NFT; you avoid the 75% burn you'd take if you self-claimed early.)*
2. **Trade / LP vS** any time on Shadow DEX  
3. **At maturity** (2026-03-01 00:00 UTC) burn vS → receive 1 S per vS via `redeem()` function
4. **Grace period** 180 days, then leftover S swept to treasury

## Example

You have: 10,000 S tokens locked in fNFT for 270 days  
You get: 10,000 vS tokens today  
You sell: vS tokens at, say, 0.25 S each *(expected example if market discounts ~75% on day-one)*  
Result: 2,500 S of liquidity today — and you keep upside as price drifts toward 1 S by maturity

## Key Innovation

❌ No vest-tracking maths  
❌ No upgradeable proxy  
❌ No admin keys  
✅ Immutable, permissionless vault  
✅ Market sets the discount  
✅ 1 vS = 1 S after maturity  

## Timeline

**Deposit window closes:** 2025-08-01 00:00 UTC  
**Maturity (redeem opens):** 2026-03-01 00:00 UTC  
**Grace ends (surplus sweep):** 2026-08-28 00:00 UTC

⚠️ **If you miss the 180-day grace period, unclaimed S is swept to treasury.**  
⚠️ **Market depth in months 0-8 depends on LP incentives (Shadow gauge, POL).**

## Future Seasons

Season-2 (if it happens) will deploy a fresh immutable vault with new parameters; Season-1 vault stays frozen.

## Key Contracts

- `ImmutableVault.sol` - Main vault (no admin, no upgrades)
- `ImmutableVSToken.sol` - The vS token
- `DecayfNFT.sol` - Test fNFT (for demos only)
- `MockToken.sol` - Test S token (for demos only)

**Functions:**
- `deposit(nftId)` - Put in fNFT, get vS tokens
- `claimBatch(k)` - Anyone can harvest vested tokens (gets 0.05% tip)
- `redeem(amount)` - Burn vS tokens, get S tokens (after maturity)
- `sweepSurplus()` - Clean up leftover tokens (after grace period)

## Ultra-Minimal & Fully Immutable Design

| Feature                     | Status |
|-----------------------------|--------|
| Admin keys / upgradability  | **None** – contracts ownerless & non-upgradeable |
| External functions          | `deposit`, `claimBatch`, `redeem`, `sweepSurplus` |
| Gas-bomb protection         | Bounded `claimBatch(k ≤ 50)` pointer loop |
| 1:1 backing guarantee       | Vault claims fNFTs once, then redeem burns vS → transfers S |
| Grace + sweep               | 180-day redemption window, permissionless surplus sweep |
| Season isolation            | Vault rejects deposits after 30d – Season-2 gets a fresh vault |

**Full security analysis** → [SECURITY_ANALYSIS.md](SECURITY_ANALYSIS.md) **(score: 9.5 / 10)**  
**User risk sheet** → [RISK_DISCLOSURE.md](RISK_DISCLOSURE.md)

## Deploy / Test

Environment setup:
```bash
# .env
RPC_URL=<your_rpc>
PRIVATE_KEY=<your_key>
```

Deploy:
```bash
forge script script/DeployImmutableVault.s.sol --broadcast
```

Test:
```bash
forge test
```

## Frontend

```bash
cd frontend && npm run dev
```

Local demo at `http://localhost:5173`

## License

MIT
