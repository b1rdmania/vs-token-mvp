# vS Vault – Turn locked Sonic fNFTs into liquid vS tokens

⚠️ **Immutable mainnet contracts. Test thoroughly before depositing real fNFTs.**

## Why Use vS

- **Get liquidity today** instead of waiting 9 months
- **No penalty** – vault waits, you don't
- **Market sets the price**, not us
- **Zero admin keys, zero upgrades, zero governance**

## How It Works

1. **Deposit fNFT** → mint equal vS immediately
2. **Trade / LP vS** any time on Shadow DEX
3. **At maturity** (2026-03-01) burn vS → receive 1 S per vS
4. **Grace period** 180 days, then leftover S swept to treasury

## Example

You have: 10,000 S tokens locked in fNFT for 270 days  
You get: 10,000 vS tokens today  
You sell: vS tokens at market rate (maybe 0.25 S per vS)  
Result: 2,500 S cash today instead of waiting 9 months

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

## Timeline

**Deposit window:** Open until DEPOSIT_END_TS (approx. 30 days). After that no new NFTs accepted.  
**Maturity:** 9 months after vault launch: MATURITY_TS = 2026-03-01 00:00 UTC  
**Grace ends:** +180 days → surplus sweep to treasury

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

## Security

**No admin keys** • **No upgrades** • **1:1 backing**

- **Gas safe** - batch processing prevents gas bombs
- **Permissionless** - anyone can claim, redeem, sweep
- **Immutable** - code never changes after deployment

**Full audit summary** → [SECURITY_ANALYSIS.md](SECURITY_ANALYSIS.md)  
**User risk sheet** → [RISK_DISCLOSURE.md](RISK_DISCLOSURE.md)

## Frontend

```bash
cd frontend && npm run dev
```

Local demo at `http://localhost:5173`

## License

MIT
