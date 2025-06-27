import React from 'react';
import ReactMarkdown from 'react-markdown';
import './WhitepaperPage.css';

const markdownContent = `
# vS Vault Whitepaper v2.0
Turn locked fNFTs into immediate liquidity

## The Problem
Sonic users received vesting NFTs (fNFTs) containing S tokens locked for 9 months. These fNFTs represent real value but can't be:
- Spent for immediate needs
- Used in DeFi protocols  
- Traded without penalty burns

This locks millions in value that could be productive today.

## The Solution: Wait-and-Claim Strategy
vS Vault provides immediate liquidity while preserving full backing:

### Core Mechanism
1. **Deposit**: User deposits fNFT (1000 S total) → Vault mints 1000 vS immediately
2. **Trade**: User trades vS on Shadow DEX at market rates for instant liquidity
3. **Vault Waits**: Vault holds all fNFTs until month 9 (no early claiming = no penalty burns)
4. **Global Maturity**: At month 9, vault claims 100% of all S tokens (0% penalty burn)
5. **Redeem**: Users can redeem vS → S at exactly 1:1 ratio on our site

### Key Innovation: Zero Penalty Burns
By never claiming early, the vault preserves 100% of the underlying S tokens. Every vS token is backed by exactly 1 S token at maturity.

## Market Dynamics

### Expected Price Evolution
- **Month 0**: vS trades at ~25% (immediate liquidity discount)
- **Month 3**: vS trades at ~50% (time value decreasing)
- **Month 6**: vS trades at ~70-85% (approaching maturity)
- **Month 9**: Redeem vS → S at 1:1 on our site

### Realistic User Behavior
Most users will exit at 80-90% recovery ("good enough") rather than wait for full maturity. Only diamond hands hold until month 9.

## Technical Architecture

### ImmutableVault.sol
- **Zero Admin Control**: No owner, no pause, no upgrades
- **Immutable Parameters**: Set once in constructor, never changed
- **Simple Flow**: Deposit fNFT → Mint vS → Hold until maturity
- **Wait-and-Claim**: Never claims early, preserves full backing
- **Pure Infrastructure**: Works forever without intervention

### ImmutableVSToken.sol  
- **Standard ERC-20**: Full DeFi composability
- **Vault-Only Minting**: Only vault can mint (deposit) or burn (redemption)
- **No Special Features**: Clean, predictable token mechanics

## Risk Disclosure

### Market Realities
- **Pre-Maturity**: vS price determined by Shadow DEX market, not protocol
- **Market Discount**: Early exit means accepting current market rate
- **Liquidity Dependent**: Large trades affected by pool depth

### What We Guarantee
- **1:1 Redemption**: At month 9+, redeem vS → S at exactly 1:1 ratio
- **Full Backing**: Every vS backed by 1 S token (zero penalty burns)
- **No Rug Risk**: Immutable contracts, no admin control

### What We Don't Promise
- **Pre-maturity Pricing**: Market decides vS value, not the protocol
- **Guaranteed Returns**: We don't manipulate prices or promise yields
- **Artificial Pegs**: No complex mechanisms to maintain specific ratios

## Shadow DEX Integration
The vS/S pool is the liquidity heart:
- **Market Pricing**: Pure supply/demand, no protocol intervention
- **Standard AMM**: Works with existing DeFi infrastructure
- **Bootstrap Liquidity**: Protocol can seed initial trading pairs

## Why This Approach Works

### Economic Honesty
Instead of complex vesting calculations or artificial pricing mechanisms, we let the market efficiently price time value. Users get access to their full future value today, paying only the market-determined time discount.

### Maximum Security
- **Immutable Design**: No admin keys or upgrade paths
- **Simple Logic**: Fewer attack vectors than complex protocols
- **Transparent Economics**: No hidden mechanisms or surprise behaviors

### Real Utility
- **Immediate Liquidity**: Cash today instead of 9-month wait
- **DeFi Composability**: Use vS across the entire Sonic ecosystem  
- **Natural Appreciation**: Price should converge toward 1:1 as maturity approaches
- **User Choice**: Market lets users decide acceptable discount

## Current Implementation

### Live Demo
Experience the complete flow with test tokens:
1. **Get Test Tokens**: Mint 15,000 TEST_S tokens
2. **Create fNFT**: Mint 10,000 TEST_S fNFT (270 days vesting)
3. **Deposit**: Get 10,000 TEST_vS immediately (1:1 value)
4. **Trade**: Swap TEST_vS for instant liquidity on Shadow DEX

### Production Ready
- Core contracts deployed on Sonic Mainnet
- Shadow DEX integration complete
- Frontend with full user experience
- Ready for real fNFT deposits

## The Bottom Line
vS Vault doesn't promise magic or guaranteed returns. We provide simple, honest infrastructure:
- Deposit your fNFT, get full-value vS tokens
- Trade at market rates for immediate liquidity
- Redeem 1:1 at maturity if you wait

The market determines fair pricing. We just provide the rails.

---

*Transform your locked fNFTs into liquid DeFi assets today.*
`;

export const WhitepaperPage: React.FC = () => {
  return (
    <div className="whitepaper-container">
      <ReactMarkdown>{markdownContent}</ReactMarkdown>
    </div>
  );
}; 