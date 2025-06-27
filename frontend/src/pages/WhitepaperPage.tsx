import React from 'react';
import ReactMarkdown from 'react-markdown';
import './WhitepaperPage.css';

const markdownContent = `
# vS Vault: Technical Whitepaper
Version 2.0 – Simplified Model

## 1. The Problem
Sonic's airdrop locks 75% of rewards in 9-month vesting NFTs (fNFTs). Users can only claim 25% now and must wait 9 months for full value. This creates:
- **Dead Capital**: 75% of airdrop value sits idle for 9 months
- **No DeFi Participation**: Locked assets can't be used in lending, LP pools, or other protocols
- **Poor User Experience**: Users who need liquidity have no good options

## 2. The Solution: Wait-and-Claim Strategy
vS Vault provides immediate liquidity while preserving full value recovery:

1. **Deposit**: User deposits fNFT (worth 1000 S total) into vault
2. **Mint**: Vault mints 1000 vS tokens immediately (full value)
3. **Trade**: User trades vS on Shadow DEX at current market rate
4. **Vault Waits**: Vault holds fNFT until month 9 (no early claiming, no penalty burns)
5. **Redeem**: At month 9+, users can redeem vS → S at exactly 1:1 ratio

## 3. Why This Works
**Market Efficiency**: Instead of complex protocol engineering, we let the market price time value. Users get immediate access to their full future value, paying a time discount through market pricing.

**Simple Economics**: No complex vesting calculations or proportional redemption. Just deposit, get tokens, and trade at market rates.

**Honest Approach**: We don't promise guaranteed returns or artificial pricing. The market decides what vS tokens are worth.

## 4. Smart Contract Architecture

### vSVault.sol
- **Simple Vault**: Accepts fNFT deposits and mints full-value vS tokens
- **Holds Assets**: Keeps deposited fNFTs until maturity (month 9)
- **Optional Redemption**: Provides direct vS→S redemption starting month 9
- **Clean Economics**: No complex fee structures or proportional calculations

### vSToken.sol  
- **Standard ERC-20**: Fully composable with all DeFi protocols
- **Mint/Burn Control**: Only vault can mint (on deposit) or burn (on redemption)
- **No Special Features**: Simple, predictable token mechanics

## 5. Market Dynamics

### Expected Price Evolution
- **Month 0**: vS trades at ~25% of face value (immediate liquidity discount)
- **Month 3**: vS trades at ~50% of face value (halfway point)
- **Month 6**: vS trades at ~70-80% of face value (approaching maturity)
- **Month 9**: Direct redemption available at 1:1 rate on our site

### User Behavior Patterns
Most users will exit before month 9 when they reach their "good enough" price point (typically 80-90% of face value). Only diamond hands will wait for full maturity.

## 6. Shadow DEX Integration
The vS/S pool on Shadow DEX is the heart of the system:
- **Market-Driven Pricing**: No artificial pegs or protocol intervention
- **Deep Liquidity**: Protocol can seed initial liquidity to bootstrap trading
- **Standard AMM**: Works with all existing DeFi infrastructure
- **Fee Generation**: Trading fees benefit liquidity providers

## 7. Risk Disclosure

### For Users
- **Market Risk**: vS price determined by market, not protocol guarantees
- **Discount Risk**: Early exit means accepting current market discount
- **Liquidity Risk**: Pool depth affects trade size and slippage

### Market Realities
- **1:1 Guarantee at Maturity**: Protocol guarantees 1:1 redemption at month 9+
- **Market Dependent Before Maturity**: Value depends on Shadow DEX pool liquidity during vesting
- **Honest Pricing**: We tell users the truth about discounts and risks

## 8. Why It's Still Valuable
Despite honest risk disclosure, vS Vault provides real value:
- **Immediate Access**: Get liquidity today instead of waiting 9 months
- **Market Choice**: Let users decide if current discount is acceptable
- **DeFi Composability**: Use vS tokens across the entire Sonic ecosystem
- **Price Appreciation**: Natural price appreciation as maturity approaches

## 9. Technical Implementation

### Current Status ✅
- Core contracts deployed on Sonic Mainnet
- Demo environment with test tokens
- Shadow DEX integration ready
- Frontend with complete user flow

### Future Enhancements
- Production deployment for real Sonic fNFTs
- Additional DEX integrations
- Lending protocol compatibility
- Cross-chain bridge support

## 10. Demo Experience
Try our live demo to see the complete flow:
1. **Mint Demo fNFT**: Get test vesting NFT (1000 tS, 9 months)
2. **Deposit to Vault**: Receive 1000 vS tokens instantly
3. **Trade on Shadow DEX**: Swap for immediate tS liquidity
4. **Experience**: See how market pricing works in practice

**Live Demo**: [vs-vault-demo.netlify.app](https://vs-vault-demo.netlify.app)

## 11. Key Innovation: Simplicity
Our main innovation is what we DON'T do:
- ❌ Complex vesting progress tracking
- ❌ Proportional redemption calculations  
- ❌ Automated claiming systems
- ❌ False promises about guaranteed returns

Instead, we focus on:
- ✅ Simple deposit → mint → trade flow
- ✅ Market-driven pricing
- ✅ Honest risk disclosure
- ✅ Clean, auditable economics

---

*vS Vault: Transform your locked fNFTs into liquid DeFi assets today.*
`;

export const WhitepaperPage: React.FC = () => {
  return (
    <div className="whitepaper-container">
      <ReactMarkdown>{markdownContent}</ReactMarkdown>
    </div>
  );
}; 