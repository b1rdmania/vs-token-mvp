# vS Vault: Instant Liquidity for Vesting NFTs

**vS Vault transforms illiquid vesting NFTs into liquid ERC-20 tokens. Deposit your Sonic fNFT → Get full-value vS tokens → Trade immediately on Shadow DEX.**

---

## The Problem & Our Solution

- **Problem:** Sonic's Season 1 airdrop locks 75% of tokens in 9-month vesting NFTs. Users can't access this value for DeFi, trading, or liquidity needs.
- **Solution:** vS Vault lets users deposit their fNFT and receive full-value vS tokens immediately. These tokens can be traded on Shadow DEX at market rates, providing instant liquidity without waiting for vesting.

## How It Works

1. **Deposit fNFT**: User deposits their Sonic vesting NFT into the vault
2. **Get vS Tokens**: Vault mints full-value vS tokens (1000 S fNFT → 1000 vS tokens)
3. **Trade for Liquidity**: User trades vS tokens on Shadow DEX for immediate Sonic tokens
4. **Market Pricing**: Shadow DEX pool determines fair market price based on time remaining

## Key Features

- **Instant Full Value**: Get 1000 vS tokens for 1000 S fNFT immediately
- **Market-Driven Pricing**: Let the market determine fair discount rates
- **Shadow DEX Integration**: Trade on Sonic's leading DEX with deep liquidity
- **Simple Economics**: No complex vesting tracking or proportional calculations

## Demo Experience

Our live demo shows the complete user journey:

1. **Mint Demo fNFT**: 1000 tS tokens, 9-month vesting
2. **Deposit to Vault**: Get 1000 vS tokens instantly  
3. **Trade on Shadow DEX**: Swap vS for tS at current market rate
4. **Immediate Liquidity**: Access funds today instead of waiting 9 months

**Live Demo**: [https://vs-vault-demo.netlify.app](https://vs-vault-demo.netlify.app)

## Smart Contract Architecture

### Core Contracts
- **vSVault.sol**: Main vault contract that holds fNFTs and mints vS tokens
- **vSToken.sol**: Standard ERC-20 token representing vault shares
- **DecayfNFT.sol**: Demo vesting NFT with Sonic-style mechanics

### Key Functions
- `deposit(nftId)`: Deposit fNFT and mint full-value vS tokens
- `redeem(amount)`: Burn vS tokens for underlying assets (month 9+)
- Shadow DEX integration for immediate trading

## Economic Model

### Simple & Honest
- **No false promises**: Market determines pricing, not protocol guarantees
- **Full value minting**: 1000 S fNFT → 1000 vS tokens
- **Market efficiency**: Shadow DEX pool handles price discovery
- **Optional redemption**: Direct vS→S redemption available at month 9

### Risk Disclosure
- vS tokens trade at market discount (typically 20-80% of face value)
- No protocol guarantee of 1:1 redemption before maturity
- Market liquidity depends on Shadow DEX pool depth
- Early exit means accepting market discount

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

1. **Simplicity**: No complex vesting calculations or streaming mechanics
2. **Market Efficiency**: Let Shadow DEX handle price discovery
3. **Honest Messaging**: Clear about market risks and discounts
4. **Instant Utility**: Immediate composability with DeFi ecosystem
5. **Sonic Native**: Built specifically for Sonic's vesting NFT mechanics

## Future Roadmap

- [ ] Production deployment for real Sonic fNFTs
- [ ] Additional DEX integrations beyond Shadow
- [ ] Cross-chain bridging capabilities
- [ ] Advanced trading strategies and automation
- [ ] Governance token and DAO structure

---

**Transform your locked fNFTs into liquid DeFi assets today.**

**Built for Sonic** | **Powered by Shadow DEX** | **Instant Liquidity**
