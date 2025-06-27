# Maturity Redemption Design: Wait-and-Claim Strategy

## Overview

The vS Vault implements a "wait-and-claim" strategy that eliminates penalty burns while guaranteeing 1:1 redemption at maturity. This approach is both economically sound and technically simple.

## The Problem with Early Claiming

Sonic's fNFTs have a linear burn penalty:
- **Month 0**: 75% penalty (only 25% claimable)
- **Month 4.5**: 37.5% penalty (62.5% claimable)  
- **Month 9**: 0% penalty (100% claimable)

Early claiming destroys tokens permanently, making true 1:1 backing impossible.

## Our Solution: Patient Vault Strategy

### Phase 1: Deposit & Trade (Months 0-9)
1. User deposits fNFT to vault
2. Vault mints full-value vS tokens (1000 S fNFT → 1000 vS tokens)
3. Vault **holds** fNFT without claiming (no penalty burns)
4. Users trade vS on Shadow DEX at market rates

### Phase 2: Maturity Redemption (Month 9+)
1. Global maturity timestamp arrives (penalty = 0%)
2. First redeemer triggers `claimAll()` inside vault
3. Vault claims 100% of all fNFTs in batch (no burns)
4. Vault now holds full S backing for all vS tokens
5. Users can redeem vS → S at exactly 1:1 ratio

## Technical Implementation

### Smart Contract Logic

```solidity
contract vSVault {
    bool public matured = false;
    uint256 public constant MATURITY_TS = 1750000000; // Month 9 timestamp
    uint256[] public depositedNFTs;
    
    function redeem(uint256 amount) external {
        // Trigger one-time mass claim on first redemption
        if (!matured) { 
            require(block.timestamp >= MATURITY_TS, "not mature");
            _claimAll();          // Claims all fNFTs at 0% penalty
            matured = true; 
        }
        
        // Standard burn and transfer
        _burn(msg.sender, amount);
        underlying.transfer(msg.sender, amount);
    }
    
    function _claimAll() internal {
        for (uint i = 0; i < depositedNFTs.length; i++) {
            nftContract.claim(depositedNFTs[i]); // 100% recovery, 0% burn
        }
    }
}
```

### Key Benefits

1. **Zero Penalty Burns**: Vault never claims early, preserves full backing
2. **True 1:1 Collateral**: Every vS token backed by exactly 1 S token at maturity
3. **Simple Implementation**: No complex streaming or keeper systems
4. **Gas Efficient**: Batch claiming reduces transaction costs
5. **Guaranteed Redemption**: Mathematical certainty of 1:1 redemption

## Economic Analysis

### Before Maturity (Months 0-9)
- vS trades at discount on Shadow DEX
- Market determines fair value based on time remaining
- No protocol intervention in pricing

### At Maturity (Month 9+)
- Vault claims all fNFTs at 0% penalty
- 1:1 redemption becomes available
- Arbitrage opportunity eliminates any remaining discount

### Grace Period (Months 9-15)
- 180-day window for redemption
- After grace period, unclaimed S swept to treasury
- Prevents indefinite vault obligations

## User Flows

### Immediate Liquidity Seeker
1. Deposit 1000 S fNFT → Get 1000 vS tokens
2. Trade vS on Shadow DEX for ~250-750 S (market rate)
3. Accept discount for immediate liquidity

### Patient Holder
1. Deposit 1000 S fNFT → Get 1000 vS tokens  
2. Hold vS tokens for 9 months
3. Redeem 1000 vS → 1000 S at maturity (1:1)

### Arbitrageur
1. Buy discounted vS on Shadow DEX (e.g., 800 vS for 600 S)
2. Hold until month 9
3. Redeem 800 vS → 800 S (200 S profit)

## Risk Analysis

### For Users
- **Market Risk**: vS may trade below desired price before maturity
- **Smart Contract Risk**: Standard vault contract risks
- **Liquidity Risk**: Shadow DEX pool may have low liquidity

### For Protocol  
- **No Economic Risk**: Vault never exposed to penalty burns
- **Simple Audit**: Straightforward contract logic
- **Predictable Obligations**: Exact S backing known at deposit time

## Comparison to Alternatives

### Complex Streaming Approach ❌
- Requires daily claiming and complex accounting
- Exposed to penalty burns if timing is wrong
- Difficult to audit and verify economic soundness

### Our Wait-and-Claim Approach ✅
- Zero penalty exposure
- Simple, auditable logic
- Guaranteed 1:1 backing at maturity
- Market handles price discovery during vesting

## Implementation Status

- ✅ Core logic designed and documented
- ✅ Economic model validated
- ⚠️ Smart contract implementation needed
- ⚠️ Maturity timestamp configuration required
- ⚠️ Grace period mechanism implementation needed

## Conclusion

The wait-and-claim strategy elegantly solves the economic backing problem while maintaining simplicity. By being patient and waiting for penalty-free claiming, the vault can guarantee true 1:1 redemption while letting the market handle price discovery during the vesting period.

This approach transforms the protocol from a complex financial engineering challenge into a simple, auditable, and economically sound solution. 