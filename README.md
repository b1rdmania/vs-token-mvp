# vS Vault Protocol

**Turn locked fNFTs into immediate liquidity**

## Overview

vS Vault allows users to deposit Sonic vesting NFTs (fNFTs) and receive tradeable vS tokens immediately, providing instant liquidity for locked assets.

### Core Mechanism

1. **Deposit**: User deposits fNFT → Vault mints vS tokens (1% fee)
2. **Trade**: User trades vS on Shadow DEX at market rates
3. **Wait**: Vault holds fNFTs until April 2026 maturity (no penalty burns)
4. **Redeem**: Users can redeem vS → S at 1:1 ratio (2% fee) after maturity

## Key Features

- **Immediate Liquidity**: Get tradeable tokens today instead of waiting 9 months
- **Zero Penalty Burns**: Vault waits until maturity to claim, preserving full backing
- **Immutable Security**: No admin keys, no upgrades, no rug risk
- **Fair Pricing**: Market determines vS value, no artificial pegs

## Economics

- **Mint Fee**: 1% (when depositing fNFT)
- **Redeem Fee**: 2% (when redeeming vS for S)
- **Total Cost**: ~3% for immediate liquidity vs. 9-month wait
- **Net Efficiency**: 97% of original fNFT value

## Timeline

- **Launch**: July 15, 2025
- **Deposit Freeze**: March 15, 2026
- **Maturity**: April 15, 2026
- **Redemption**: Available after maturity at 1:1 ratio

## Contracts

- **ImmutableVault.sol**: Core vault logic with deposit/harvest/redeem functions
- **ImmutableVSToken.sol**: Standard ERC-20 token minted by vault

## Security

- All parameters immutable at deployment
- Month-9 gate prevents early harvesting
- Pro-rata redemption prevents hostage NFT attacks
- Comprehensive test suite with 15/15 tests passing

## Usage

```bash
# Install dependencies
forge install

# Run tests
forge test

# Deploy (update environment variables first)
forge script script/DeployImmutableVault.s.sol --broadcast
```

## Frontend

React app with wallet integration for depositing fNFTs and trading vS tokens.

```bash
cd frontend
npm install
npm run dev
```

---

**Ready for production deployment.**
