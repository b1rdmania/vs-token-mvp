import React from 'react';
import ReactMarkdown from 'react-markdown';
import './WhitepaperPage.css';

const markdownContent = `
# vS Vault: Technical Whitepaper
Version 2.0 – Updated for Simplified Model

## 1. The Problem
Sonic's airdrop locks 75% of rewards in 9-month vesting NFTs (fNFTs). Users can only claim 25% now and must wait 9 months for full value. This creates:
- **Dead Capital**: 75% of airdrop value sits idle for 9 months
- **No DeFi Participation**: Locked assets can't be used in lending, LP pools, or other protocols
- **Forced HODLing**: Users who need liquidity must sell at massive discounts on sketchy NFT marketplaces

## 2. The Solution: Simple Full-Value Tokenization
vS Vault provides immediate liquidity through a beautifully simple model:

1. **Deposit**: User deposits fNFT (worth 1000 S total) into vault
2. **Mint**: Vault mints 1000 vS tokens immediately (full value)
3. **Trade**: User trades vS in Shadow DEX pool at market rate (~0.25 S per vS initially)
4. **Appreciate**: vS price naturally rises toward 1:1 as vesting approaches completion
5. **Exit**: At month 9, vault claims all fNFTs and vS trades at ~1:1 with S

## 3. Why This Works
**Market Efficiency**: Instead of complex protocol engineering, we let the market price time value. Users get immediate access to their full future value, paying a time discount through market pricing.

**No Cross-Subsidization**: Unlike complex models that track individual vesting progress, all vS tokens are fungible and backed by the same pooled fNFT assets.

**Pure Liquidity**: Creates a deep, liquid market for vesting Sonic tokens without breaking the original vesting mechanics.

## 4. Smart Contract Architecture

### vSVault.sol
- **ERC-4626 Vault**: Standard interface for tokenized vaults
- **Full-Value Minting**: Mints vS tokens equal to fNFT total value on deposit
- **Pooled Assets**: All deposited fNFTs are pooled for maximum efficiency
- **Claim Management**: Periodically claims vested tokens from all fNFTs

### vSToken.sol  
- **Standard ERC-20**: Fully composable with all DeFi protocols
- **Mint/Burn Control**: Only vault can mint (on deposit) or burn (on redemption)
- **No Rebasing**: Simple, predictable token mechanics

## 5. Market Dynamics

### Initial State (Month 0)
- fNFT deposited: 1000 S total value
- vS minted: 1000 vS tokens
- Market price: ~0.25 S per vS (75% time discount)
- User gets: ~250 S immediate liquidity

### Mid-Vesting (Month 4-5)
- vS price: ~0.60 S per vS (40% time discount)
- Arbitrage opportunities keep price efficient
- Deep Shadow DEX liquidity enables large trades

### Near Maturity (Month 8-9)
- vS price: ~0.95 S per vS (5% time discount)
- Vault begins claiming mature fNFTs
- Price converges toward full backing

## 6. No False Promises
**Important**: The protocol does NOT guarantee 1:1 redemption. Market forces determine vS value at all times. At month 9:
- Vault will hold claimed S tokens from matured fNFTs
- vS tokens can be redeemed for proportional share of vault assets
- Market price should approach 1:1, but this is market-driven, not protocol-guaranteed

## 7. Shadow DEX Integration
The vS/S pool on Shadow DEX is the heart of the system:
- **Deep Liquidity**: Protocol incentives bootstrap initial liquidity
- **Efficient Pricing**: Arbitrage bots keep prices aligned with time value
- **Composability**: Standard AMM pool enables other protocols to integrate
- **Fee Generation**: Trading fees benefit liquidity providers

## 8. Risk Considerations

### For Users
- **Market Risk**: vS price determined by market, not protocol guarantees
- **Liquidity Risk**: Pool depth affects trade size and slippage
- **Smart Contract Risk**: Code is immutable and non-upgradeable

### For the Ecosystem  
- **Pool Death Scenario**: If selling pressure overwhelms liquidity, price could crash below fundamental value
- **No Recovery Mechanism**: Protocol cannot intervene in market pricing
- **Dependency on External LP**: Relies on Shadow DEX and external liquidity providers

## 9. Why It's Still Valuable
Despite risks, vS Vault provides massive value:
- **Immediate Liquidity**: Get 25% of locked value instantly (vs 0% without vault)
- **Time Optionality**: Can exit early at market rates vs waiting 9 months
- **DeFi Composability**: Use vS in lending, as collateral, in other pools
- **Price Appreciation**: Benefit from natural price appreciation over time

## 10. Technical Implementation

### Phase 1: Core Contracts ✅
- vSVault.sol (ERC-4626 compliant)
- vSToken.sol (standard ERC-20)
- Deployed on Sonic Mainnet

### Phase 2: Market Integration ✅  
- Shadow DEX pool deployment
- Initial liquidity seeding
- Frontend integration

### Phase 3: Ecosystem Growth
- Integration with lending protocols
- Additional LP incentives
- Community governance (if needed)

## 11. Get Involved
- **Try the Demo**: [sonicvs.app/TestnetDemo](https://sonicvs.app/TestnetDemo)
- **Review Code**: [GitHub Repository](https://github.com/b1rdmania/vs-token-mvp)
- **Provide Liquidity**: Earn fees in the vS/S Shadow DEX pool
- **Build on Top**: Integrate vS into your DeFi protocol

---

*vS Vault: Simple, honest, market-driven liquidity for vesting assets.*
`;

export const WhitepaperPage: React.FC = () => {
  return (
    <div className="whitepaper-container">
      <ReactMarkdown>{markdownContent}</ReactMarkdown>
    </div>
  );
}; 