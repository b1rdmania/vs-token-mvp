# vS Vault Protocol

**Turn illiquid vesting NFTs into liquid DeFi tokens.**

> **The Problem:** Sonic airdrop recipients have vesting NFTs locked for 9 months, missing DeFi opportunities.  
> **The Solution:** Deposit your fNFT, get tradeable vS tokens immediately, redeem 1:1 at maturity.

## 🎯 **What This Protocol Does**

The vS Vault Protocol converts illiquid vesting Sonic NFTs (fNFTs) into liquid ERC-20 tokens (vS) that can be traded immediately. Users get **cash today** instead of waiting 9 months, while the protocol ensures **full S tomorrow** through a wait-and-harvest strategy.

### **Core Value Proposition**
- **Immediate Liquidity:** Get 99% of fNFT face value as tradeable vS tokens
- **Market Pricing:** vS tokens trade at market-determined discounts (no artificial pegs)
- **Zero Penalty Burns:** Vault waits until maturity to claim, preserving full backing
- **1:1 Redemption:** Every vS token backed by 1 S token after April 2026 harvest

## 🔄 **How It Works (60 seconds)**

1. **Deposit fNFT** → Transfer your vesting NFT to the vault permanently
2. **Mint vS (-1%)** → Get 990 vS tokens for 1,000 S face value (1% mint fee)
3. **Trade/LP** → Use vS tokens immediately on Shadow DEX, lending, or liquidity provision
4. **Month 9: Vault Harvest** → Protocol claims all fNFTs at 0% penalty burn
5. **Redeem 1:1 (-2%)** → Burn 990 vS tokens, receive ~970 S tokens (2% redeem fee)

## 💰 **Economics**

| Fee Type | Rate | Purpose |
|----------|------|---------|
| **Mint Fee** | 1% | Protocol treasury funding |
| **Redeem Fee** | 2% | Harvest gas + LP incentives |
| **Total Cost** | ~3% | Price for 9-month early liquidity |
| **Net Efficiency** | ~97% | Of original fNFT value |

## 🛡️ **Security Features**

### **Immutable Design**
- ✅ **Zero admin functions** - No owner, no upgrades, no parameter changes
- ✅ **Hardcoded parameters** - All fees and timestamps locked at deployment
- ✅ **No proxy patterns** - Direct implementation eliminates upgrade risks

### **Attack Prevention**
- ✅ **Self-delegation pattern** - Prevents delegation manipulation attacks
- ✅ **Reentrancy protection** - All external functions protected
- ✅ **Gas bomb protection** - Bounded batch processing (max 20 NFTs)
- ✅ **Proportional redemption** - No hostage scenarios, always redeemable

### **Wait-and-Harvest Strategy**
- ✅ **Zero penalty burns** - Vault never claims early, waits for 0% burn window
- ✅ **Retry-safe batching** - Failed NFT claims don't block system
- ✅ **Permissionless harvesting** - Anyone can trigger harvest after maturity

## 🌊 **Why This Helps Sonic**

- **TVL Growth:** Locked airdrop value becomes active DeFi liquidity
- **Reduced Dump Risk:** Selling pressure spreads over 9 months vs day-one dumping  
- **User Retention:** Recipients stay in ecosystem to farm, lend, and provide liquidity
- **Market Efficiency:** Price discovery for time value of locked tokens

## 📁 **Repository Structure**

```
vS/
├── src/                          # Smart contracts
│   ├── ImmutableVault.sol        # Main vault logic (deposit/harvest/redeem)
│   ├── ImmutableVSToken.sol      # ERC-20 token (vault-minted liquidity)
│   ├── interfaces/               # Minimal contract interfaces
│   └── base/                     # Custom ERC-20 + reentrancy guard
├── test/                         # Comprehensive test suite
├── script/                       # Deployment and management scripts
├── frontend/                     # React app for user interface
└── docs/                         # Additional documentation
```

## 📊 **Contract Addresses (Sonic Mainnet)**

| Contract | Address | Purpose |
|----------|---------|---------|
| **ImmutableVault** | `0x37BD20868FB91eB37813648F4D05F59e07A1bcfb` | Main vault logic |
| **ImmutableVSToken** | `0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031` | vS token contract |
| **Shadow DEX Pool** | `0x0516676e5f9f0253228483a5f61313a53b4be07f` | vS/tS trading pair |

## 🔍 **Key Design Decisions**

### **Why Wait-and-Harvest?**
- **Preserves full backing:** No penalty burns = every vS backed by 1 S
- **Eliminates timing risk:** No complex streaming or partial claims
- **Simplifies economics:** Clear 1:1 redemption guarantee

### **Why Immutable?**
- **Eliminates rug risk:** No admin keys, no upgrades, no parameter changes
- **Builds trust:** Code is law, no human intervention possible
- **Reduces complexity:** No governance, no multisig, no upgrade paths

### **Why Market Pricing?**
- **Honest price discovery:** Market sets discount based on time value
- **No artificial pegs:** Protocol doesn't promise impossible economics
- **Sustainable model:** No protocol subsidies required

## 📚 **Additional Resources**

- **[Security Analysis](./SECURITY_ANALYSIS.md)** - Comprehensive security audit
- **[Risk Disclosure](./RISK_DISCLOSURE.md)** - Important risks and considerations  
- **[Audit Summary](./AUDIT_READY_SUMMARY.md)** - Production readiness checklist
- **[Marketing Copy](./MARKETING_COPY_FINAL.md)** - User-facing messaging

## 🤝 **Contributing**

This protocol is designed to be immutable after deployment. However, during development:

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests
4. Submit a pull request

## ⚖️ **License**

MIT License - See [LICENSE](./LICENSE) for details.

---

**© 2025 vS Vault Protocol**  
*Ready to turn waiting into doing.*
