# 🔍 Sonic fNFT Research Required

## ❓ What We Don't Know Yet

The contract logic is **audit-ready**, but we need real fNFT details for deployment:

### 1. **Real fNFT Contract Address**
- **Current**: `0x146D8C75c0b0E8F0BECaFa5c26C8F7C1b5c2C0B1` (placeholder?)
- **Need**: Actual verified Sonic fNFT contract address
- **Verification**: Check if this address exists on Sonic mainnet

### 2. **fNFT Interface Compatibility**
Our vault expects these functions:
```solidity
interface IDecayfNFT {
    function claimDelegates(uint256 tokenId) external view returns (address);
    function getTotalAmount(uint256 tokenId) external view returns (uint256);
    function claimable(uint256 tokenId) external view returns (uint256);
    function claimVestedTokens(uint256 tokenId) external returns (uint256);
    function setDelegate(uint256 tokenId, address delegate) external;
}
```
- **Need**: Verify real fNFT contract implements these exact function signatures
- **Risk**: If interface differs, we need to update our contract

### 3. **Vesting Schedule Details**
- **Current assumption**: 9-month vesting period
- **Need**: Actual vesting duration of Sonic fNFTs
- **Impact**: Affects maturity timestamp calculation

### 4. **Delegation Mechanics**
- **Critical**: Verify delegation actually works as expected
- **Test**: Can vault successfully call `setDelegate()` after receiving fNFT?
- **Test**: Does `claimVestedTokens()` respect delegation?

### 5. **Treasury Address**
- **Current**: `0x000...000` (placeholder)
- **Need**: Real protocol treasury address (multisig?)

## 🔬 Research Actions

### Immediate (Before Audit)
1. **Verify fNFT contract exists** on Sonic mainnet
2. **Check interface compatibility** with our expectations
3. **Test delegation flow** on testnet if possible

### Before Deployment
1. **Get real treasury address**
2. **Confirm vesting schedules** and set appropriate maturity dates
3. **Test full integration** with real fNFT contract

## 🎯 What's Ready vs What's Not

### ✅ **Ready for Audit**
- Contract logic and security patterns
- Fee calculations (1% + 0.05% = 1.05%)
- Proportional redemption math
- Reentrancy protection
- Gas optimization

### ⏳ **Needs Real Data**
- fNFT contract address
- Interface compatibility verification
- Deployment timing parameters
- Treasury address

## 💡 Deployment Strategy

1. **Ship audit package** - Logic is sound regardless of addresses
2. **Research real fNFT details** in parallel
3. **Update deployment params** once we have real data
4. **Test on testnet** with real parameters
5. **Deploy to mainnet** post-audit

---

**The contract architecture is bulletproof, but we need real Sonic fNFT details before mainnet deployment.** 🔍 