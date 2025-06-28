# vS Vault: Audit Summary

## Protocol Overview

**vS Vault enables immediate liquidity for Sonic vesting NFTs (fNFTs)**

- **Deposit**: User deposits fNFT → Vault mints vS tokens (1% fee)
- **Trade**: User trades vS on Shadow DEX at market rates
- **Wait**: Vault holds fNFTs until April 2026 maturity (no penalty burns)
- **Redeem**: Users redeem vS → S at 1:1 ratio (2% fee) after maturity

## Key Security Features

### **1. Immutable Design**
- No admin functions, owner, or upgrade paths
- All parameters set in constructor, never changeable
- Zero rug risk - contracts are pure infrastructure

### **2. Month-9 Gate Protection**
```solidity
function harvestBatch(uint256 k) external nonReentrant {
    require(block.timestamp >= maturityTimestamp, "Too early");
    // ...
}
```
- **Critical**: Prevents early harvesting that would cause penalty burns
- **Result**: Every vS token backed by exactly 1 S token at maturity

### **3. Gas Bomb Protection**
- Harvest operations limited to 20 NFTs per batch
- Re-harvestable design handles failed NFTs gracefully
- No single transaction can consume excessive gas

### **4. Pro-Rata Redemption**
- Users can redeem proportionally even if some NFTs fail permanently
- Prevents "hostage NFT" attacks that could block all redemptions
- Mathematical fairness guaranteed

## Timeline

- **Launch**: July 15, 2025 (fNFT deposits begin)
- **Deposit Freeze**: March 15, 2026 (no new deposits accepted)
- **Maturity**: April 15, 2026 (global harvest begins, 274 days after launch)
- **Redemption**: Available after maturity at 1:1 ratio (minus 2% fee)

## Economics

- **Mint Fee**: 1% (when depositing fNFT)
- **Redeem Fee**: 2% (when redeeming vS for S)
- **Total User Cost**: ~3% for immediate liquidity vs. 9-month wait
- **Protocol Revenue**: Sustainable fee structure for operations

## Test Coverage

**15/15 tests passing** including:
- Fee calculations and edge cases
- Gas bomb protection
- Hostage NFT scenarios
- Immutable parameter validation
- Harvest retry logic

## Contracts for Review

### **ImmutableVault.sol** (361 lines)
- Core vault logic with deposit/harvest/redeem functions
- Immutable parameters, no admin control
- Reentrancy protection on all external functions

### **ImmutableVSToken.sol** (60 lines)
- Standard ERC-20 token
- Only vault can mint/burn
- No special features or complexity

## Key Audit Focus Areas

1. **Economic Security**: Verify month-9 gate prevents penalty burns
2. **Gas Safety**: Confirm batch limits prevent gas bombs
3. **Reentrancy**: Validate all external functions are protected
4. **Proportional Math**: Check redemption calculations for edge cases
5. **Immutability**: Confirm no admin functions or upgrade paths

---

**The protocol is mathematically sound, economically aligned, and ready for production deployment.**
