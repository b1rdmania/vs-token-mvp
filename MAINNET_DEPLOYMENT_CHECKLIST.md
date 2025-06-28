# Mainnet Deployment Checklist

## What's Locked-In ✅
- **Contract logic**: 4 functions, 1% protocol + 0.05% keeper fee, proportional redemption, self-delegation
- **Security patterns**: Reentrancy protection, gas bomb limits, immutable design
- **Architecture**: Final and audit-ready

## What's Still Variable ⏳
1. **fNFT contract address + interface**
2. **Maturity & freeze timestamps** (must match Season-1 schedule)
3. **Treasury multisig**
4. **Chain-ID / RPC endpoints** (mainnet vs testnet)

---

## To-Do List Before Mainnet Deploy

| Step | Owner | Output |
|------|-------|--------|
| 1. Obtain canonical Season-1 fNFT address from Sonic core team. | Biz-ops | Confirmed `sonicNFT` address + ABI. |
| 2. Verify interface compatibility: `getTotalAmount`, `claimVestedTokens`, `setDelegate`. | Dev | Short Foundry test proving each call works. |
| 3. Pull official vesting dates (claim portal docs or chain events). | Research | Exact `maturityTimestamp` & `vaultFreezeTimestamp`. |
| 4. Pick treasury multisig (3-of-5 or Sonic Grants DAO). | Ops / Treasury | Final `protocolTreasury` address. |
| 5. Update **DeployImmutableVault.s.sol** to read from env vars. | Dev | Script ready ✅ |
| 6. Patch **params.csv** with real values. | Dev | File ready for auditors & explorers. |
| 7. Dry-run deploy on Sonic testnet with those params; run full deposit → maturity → redeem cycle. | QA | Green checklist. |
| 8. Final "go/no-go" meeting; sign multisig; push mainnet tx. | Team | On-chain deployment hash. |

### Environment Variables for Deploy Script
```bash
export SONIC_FNFT=0x...        # Season-1 fNFT contract
export UNDERLYING_S=0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38
export TREASURY=0x...          # Protocol treasury multisig
export MATURITY_TS=...         # Unix timestamp for maturity
export FREEZE_TS=...           # Unix timestamp for vault freeze
export PRIVATE_KEY=0x...       # Deployer private key
```

### Deployment Command
```bash
forge script script/DeployImmutableVault.s.sol:DeployImmutableVault \
  --rpc-url $SONIC_RPC \
  --broadcast \
  --verify
```

---

## Audit Hand-Off (Can Proceed Now) ✅

- ✅ Hand auditors the **vS-vault-audit-package.zip** containing contracts + tests
- ✅ Flag that addresses/timestamps will be injected at deploy but **no code changes** will be made
- ✅ Contract logic is frozen and ready for security review

---

**Architecture frozen, parameters pending. Once items 1-4 are filled, you can mint the vault.** 🚀 