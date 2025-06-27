# vS Vault

**Turn locked tokens into liquid tokens**

Your fNFT locks 1000 S tokens for 9 months. Deposit it, get 1000 vS tokens now. Trade vS tokens anytime.

## How It Works

1. **Deposit** - Give us your locked fNFT
2. **Get vS tokens** - We mint you the full amount  
3. **Trade** - Sell vS tokens for cash anytime
4. **Redeem** - After 9 months, swap vS back to S tokens at 1:1

## Why Use This

- **Get cash now** instead of waiting 9 months
- **No penalties** - we wait, you don't have to
- **Fair price** - market sets the rate, not us
- **No admin** - contract runs itself, no one controls it

## Example

You have: 10,000 S tokens locked in fNFT for 270 days
You get: 10,000 vS tokens today
You sell: vS tokens at market rate (maybe 25% of face value)
Result: Cash today instead of waiting 9 months

## Technical Details

**Contracts:**
- `ImmutableVault.sol` - Main vault (no admin, no upgrades)
- `ImmutableVSToken.sol` - The vS token
- `DecayfNFT.sol` - Test fNFT (for demos only)
- `MockToken.sol` - Test S token (for demos only)

**Functions:**
- `deposit(nftId)` - Put in fNFT, get vS tokens
- `claimBatch(k)` - Anyone can harvest vested tokens (gets 0.05% tip)
- `redeem(amount)` - Burn vS tokens, get S tokens (after maturity)
- `sweepSurplus()` - Clean up leftover tokens (after 6 months grace)

**Timeline:**
- Month 0-1: Deposit window open
- Month 1-9: Keepers harvest vested tokens
- Month 9+: Users can redeem vS for S at 1:1
- Month 15+: Anyone can sweep leftover tokens

## Deploy

```bash
forge script script/DeployImmutableVault.s.sol --broadcast
```

## Test

```bash
forge test
```

## Security

- **No admin keys** - no one can drain funds
- **No upgrades** - code never changes
- **No governance** - no voting, no proposals
- **Gas safe** - batch processing prevents gas bombs
- **1:1 backing** - every vS token backed by 1 S token at maturity

See `SECURITY_ANALYSIS.md` for full audit.

## Frontend

```bash
cd frontend && npm run dev
```

Local demo at `http://localhost:5173`

## License

MIT
