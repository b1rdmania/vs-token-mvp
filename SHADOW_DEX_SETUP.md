# Shadow DEX Pool Setup Guide
## Creating D-vS / tS Liquidity Pool for Live Demo

### **🎯 What You Have (Deployed on Sonic Mainnet)**
- ✅ **tS Token**: `0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49` (1M tokens in vault)
- ✅ **D-vS Token**: `0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031` (ready to mint)
- ✅ **fNFT Contract**: `0xdf34078C9C8E5891320B780F6C8b8a54B784108C`
- ✅ **Vault Contract**: `0x37BD20868FB91eB37813648F4D05F59e07A1bcfb`

### **🚀 Quick Setup (30 minutes)**

#### **Step 1: Get Initial Tokens**
```bash
# You need:
1. Get some D-vS tokens (mint fNFT → deposit to vault)
2. Get tS tokens from faucet (already have 1M in vault)
3. Get S tokens for gas fees
```

#### **Step 2: Mint D-vS Tokens**
1. Go to your demo app: http://localhost:5173/
2. **Mint fNFT**: Use the demo to mint a few test fNFTs 
3. **Deposit to Vault**: Deposit fNFT to get D-vS tokens
4. **Target**: Get ~1000 D-vS tokens for initial liquidity

#### **Step 3: Get tS Tokens**
```bash
# Option A: Use faucet in demo app
# Option B: Withdraw from vault (vault has 1M tokens)
# Target: Get ~850 tS tokens (0.85 ratio for 15% discount)
```

#### **Step 4: Go to Shadow DEX**
1. **Visit**: https://app.shadow.so/ or https://shadow.so/
2. **Connect**: MetaMask to Sonic Mainnet (Chain ID: 146)
3. **Navigate**: Liquidity → Add Liquidity

#### **Step 5: Create Pool**
```
Token A: D-vS (0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031)
Token B: tS (0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49)

Initial Liquidity:
- 1000 D-vS tokens
- 850 tS tokens (15% discount rate)

Pool Settings:
- Fee Tier: 0.3% (standard)
- Price Range: ±5-10% (concentrated liquidity)
```

#### **Step 6: Add Liquidity & Stake**
1. **Approve tokens** for Shadow DEX
2. **Add liquidity** in 1:0.85 ratio
3. **Stake LP tokens** for xSHADOW rewards
4. **Vote on gauges** to direct emissions

### **📱 Update Demo App**
Replace simulation with real Shadow DEX integration:

```tsx
// Real Shadow Router address (need to find actual address)
const SHADOW_ROUTER = "0x..." // Shadow DEX router on Sonic

// Real trade function
const executeRealTrade = async (dvsAmount: string) => {
  const router = new ethers.Contract(SHADOW_ROUTER, SHADOW_ABI, signer);
  
  // Actual swap through Shadow DEX
  const tx = await router.exactInputSingle({
    tokenIn: "0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031", // D-vS
    tokenOut: "0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49", // tS
    fee: 3000, // 0.3%
    recipient: userAddress,
    deadline: Math.floor(Date.now() / 1000) + 1800,
    amountIn: ethers.utils.parseEther(dvsAmount),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0
  });
  
  return tx;
};
```

### **🎬 Demo Flow (Ready in 30 mins)**

1. **Mint fNFT** → User gets test vesting NFT
2. **Deposit to Vault** → User gets D-vS tokens instantly  
3. **Trade on Shadow DEX** → **REAL LIQUIDITY POOL** 
4. **Get tS tokens** → User has immediate liquidity vs 9-month wait

### **💡 Benefits of Real Pool**
- ✅ **Actual price discovery** (not simulated 0.85 rate)
- ✅ **Real slippage** and market dynamics
- ✅ **True MEV protection** from Shadow DEX
- ✅ **Genuine composability** demonstration
- ✅ **LP rewards** in xSHADOW tokens
- ✅ **Fee sharing** (100% to xSHADOW holders)

### **🔧 Technical Requirements**
```bash
# Gas costs (approximate):
- Create pool: ~0.1 S
- Add liquidity: ~0.05 S  
- Trade execution: ~0.001 S

# Total setup cost: ~0.2 S ($0.40 at current prices)
```

### **📊 Expected Results**
- **Pool TVL**: $1,700 (1000 D-vS + 850 tS)
- **Trading fee**: 0.3% (competitive with Uniswap)
- **Price impact**: <1% for small trades
- **xSHADOW rewards**: Based on vote distribution

**Ready for your afternoon demo! 🚀** 