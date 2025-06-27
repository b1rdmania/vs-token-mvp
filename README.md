# vS Vault: Instant Liquidity for Vesting NFTs

**vS Vault transforms illiquid vesting NFTs into liquid ERC-20 tokens. Deposit your Sonic fNFT → Get full-value vS tokens → Trade immediately on Shadow DEX.**

**🔒 Truly Immutable Design: Zero admin control after deployment - operates as pure decentralized infrastructure.**

---

## The Problem & Our Solution

- **Problem:** Sonic's Season 1 airdrop locks 75% of tokens in 9-month vesting NFTs. Users can't access this value for DeFi, trading, or liquidity needs.
- **Solution:** vS Vault lets users deposit their fNFT and receive full-value vS tokens immediately. These tokens can be traded on Shadow DEX at market rates, providing instant liquidity without waiting for vesting.

## How It Works

1. **Deposit fNFT**: User deposits their Sonic vesting NFT into the vault
2. **Get vS Tokens**: Vault mints full-value vS tokens (1000 S fNFT → 1000 vS tokens)
3. **Trade for Liquidity**: User trades vS tokens on Shadow DEX for immediate Sonic tokens
4. **Vault Waits**: Vault holds fNFTs until month 9 maturity (no early claiming, no penalty burns)
5. **1:1 Redemption**: At month 9+, users can redeem vS → S at exactly 1:1 ratio through vault

## Key Features

- **Instant Full Value**: Get 1000 vS tokens for 1000 S fNFT immediately
- **Market-Driven Pricing**: Let the market determine fair discount rates
- **Shadow DEX Integration**: Trade on Sonic's leading DEX with deep liquidity
- **Simple Economics**: No complex vesting tracking or proportional calculations
- **🔒 Immutable Vault**: Zero admin control - no pause, no owner functions, no rug risk
- **⚡ Pure Infrastructure**: Works forever without intervention, like a bridge or AMM

## Demo Experience

Our live demo shows the complete user journey:

1. **Mint Demo fNFT**: 1000 tS tokens, 9-month vesting
2. **Deposit to Vault**: Get 1000 vS tokens instantly  
3. **Trade on Shadow DEX**: Swap vS for tS at current market rate
4. **Immediate Liquidity**: Access funds today instead of waiting 9 months

**Live Demo**: [https://vs-vault-demo.netlify.app](https://vs-vault-demo.netlify.app)

## Smart Contract Architecture

### Core Contracts
- **ImmutableVault.sol**: Production vault with zero admin control (mainnet)
- **vSVault.sol**: Demo vault with admin functions (testnet only)
- **vSToken.sol**: Standard ERC-20 token representing vault shares
- **DecayfNFT.sol**: Demo vesting NFT with Sonic-style mechanics

### Key Functions
- `deposit(nftId)`: Deposit fNFT and mint full-value vS tokens
- `redeem(amount)`: Burn vS tokens for underlying assets (month 9+)
- Shadow DEX integration for immediate trading

## Economic Model

### Simple & Honest
- **True 1:1 backing**: Every vS token backed by exactly 1 S token at maturity
- **No penalty burns**: Vault waits until month 9, claims at 0% penalty
- **Market efficiency**: Shadow DEX pool handles price discovery during vesting period
- **Guaranteed redemption**: Direct vS→S redemption at 1:1 ratio available at month 9+

### Risk Disclosure
- vS tokens trade at market discount before maturity (typically 20-80% of face value)
- Protocol guarantees 1:1 redemption only at month 9+ maturity
- Market liquidity depends on Shadow DEX pool depth during vesting period
- Early exit via trading means accepting market discount

## Technical Implementation

### Deployment Status
- ✅ **Sonic Mainnet**: Fully deployed and functional
- ✅ **Shadow DEX**: Integrated liquidity pools
- ✅ **Frontend**: Complete user interface
- ✅ **Demo Flow**: End-to-end working demo

### Contract Addresses (Sonic Mainnet)
- **Demo fNFT**: `0xdf34078C9C8E5891320B780F6C8b8a54B784108C`
- **Demo tS Token**: `0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49`
- **vS Token**: `0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031`
- **Vault**: `0x37BD20868FB91eB37813648F4D05F59e07A1bcfb`

## Development Setup

```bash
# Install dependencies
npm install

# Start frontend
cd frontend && npm run dev

# Compile contracts
forge build

# Run tests
forge test

# Deploy contracts
forge script script/DeployDemo.s.sol --rpc-url sonic --broadcast
```

## Testing

```bash
# Run all tests
forge test -vv

# Test specific contract
forge test --match-contract VaultTest

# Test with gas reporting
forge test --gas-report
```

## Innovation Highlights

1. **True Immutability**: Zero admin control after deployment - operates as pure infrastructure
2. **Simplicity**: No complex vesting calculations or streaming mechanics
3. **Market Efficiency**: Let Shadow DEX handle price discovery
4. **Honest Messaging**: Clear about market risks and discounts
5. **Instant Utility**: Immediate composability with DeFi ecosystem
6. **Sonic Native**: Built specifically for Sonic's vesting NFT mechanics
7. **Maximum Security**: No owner keys, no pause functions, no rug pull risk

## Future Roadmap

- [ ] Production deployment for real Sonic fNFTs
- [ ] Additional DEX integrations beyond Shadow
- [ ] Cross-chain bridging capabilities
- [ ] Advanced trading strategies and automation
- [ ] Governance token and DAO structure

---

**Transform your locked fNFTs into liquid DeFi assets today.**

**Built for Sonic** | **Powered by Shadow DEX** | **Instant Liquidity**
