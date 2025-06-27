# Shadow DEX Pool Setup Guide
## Creating vS / tS Liquidity Pool for Live Demo

### **🎯 CURRENT DEPLOYED CONTRACTS (Sonic Mainnet)**
- ✅ **tS Token**: `0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49` 
- ✅ **vS Token**: `0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031`
- ✅ **fNFT Contract**: `0xdf34078C9C8E5891320B780F6C8b8a54B784108C`
- ✅ **Vault Contract**: `0x37BD20868FB91eB37813648F4D05F59e07A1bcfb`

### **✅ BOOTSTRAP COMPLETE (Just Done)**
- 🎉 **5000 vS tokens**: MINTED via emergency function
- 🎉 **1000 tS tokens**: MINTED via faucet  
- 🎉 **Ready for liquidity pool**: Both tokens in deployer wallet

### **🚀 Quick Setup Process**

#### **Step 1: Approve Tokens for Shadow DEX**
```bash
# Approve vS tokens
cast send 0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031 "approve(address,uint256)" [SHADOW_ROUTER] 1000000000000000000000 --rpc-url https://sonic.drpc.org --private-key [YOUR_KEY]

# Approve tS tokens  
cast send 0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49 "approve(address,uint256)" [SHADOW_ROUTER] 850000000000000000000 --rpc-url https://sonic.drpc.org --private-key [YOUR_KEY]
```

#### **Step 2: Create Shadow DEX Pool**
1. **Visit**: https://app.shadow.fi/ or https://shadow.fi/
2. **Connect**: MetaMask to Sonic Mainnet (Chain ID: 146)
3. **Navigate**: Pools → Create Pool

#### **Step 3: Pool Configuration**
```
Token A: vS
Contract: 0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031
Symbol: vS

Token B: tS  
Contract: 0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49
Symbol: tS

Initial Liquidity:
- 1000 vS tokens (full value)
- Market determines actual ratio based on time to maturity

Pool Settings:
- Fee Tier: 0.3% (standard AMM fee)
- Price Range: Market-driven (no artificial pegs)
```

#### **Step 4: Add Initial Liquidity**
```
Amount A: 1000 vS tokens
Amount B: [Market determines amount]
Ratio: Let market decide fair discount rate

Expected behavior: Market will price vS at discount to face value
```

### **📱 Frontend Integration - Real Shadow DEX**

```typescript
// Real Shadow DEX integration
const SHADOW_ROUTER = "0x..." // Shadow router address
const SHADOW_FACTORY = "0x..." // Shadow factory address  

// Real trading function
export const executeRealTrade = async (
  vsAmount: string,
  signer: ethers.Signer
) => {
  const routerContract = new ethers.Contract(
    SHADOW_ROUTER,
    SHADOW_ROUTER_ABI,
    signer
  );

  // Get market price for vS tokens
  const amountsOut = await routerContract.getAmountsOut(
    ethers.utils.parseEther(vsAmount),
    [
      "0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031", // vS
      "0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49"  // tS  
    ]
  );

  // Execute real swap at market price
  const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 min
  const minAmountOut = amountsOut[1].mul(97).div(100); // 3% slippage

  const tx = await routerContract.swapExactTokensForTokens(
    ethers.utils.parseEther(vsAmount),
    minAmountOut,
    [
      "0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031", // vS
      "0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49"  // tS
    ],
    await signer.getAddress(),
    deadline
  );

  return { 
    hash: tx.hash, 
    expectedOut: ethers.utils.formatEther(amountsOut[1]) 
  };
};

// Pool info function
export const getPoolInfo = async () => {
  const factoryContract = new ethers.Contract(
    SHADOW_FACTORY,
    SHADOW_FACTORY_ABI,
    provider
  );

  const poolAddress = await factoryContract.getPair(
    "0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031", // vS
    "0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49"  // tS
  );

  if (poolAddress === ethers.constants.AddressZero) {
    throw new Error("Pool not found - create pool first");
  }

  const poolContract = new ethers.Contract(poolAddress, PAIR_ABI, provider);
  const reserves = await poolContract.getReserves();
  
  return {
    poolAddress,
    tvl: reserves[0].add(reserves[1]),
    currentRate: reserves[1].div(reserves[0]) // tS per vS (market rate)
  };
};
```

### **🎬 DEMO FLOW (Simplified Model)**

1. **User mints fNFT** → Gets demo vesting NFT (1000 tS, 9 months)
2. **User deposits to Vault** → Gets 1000 vS tokens instantly (full value)  
3. **User trades on Shadow DEX** → Market determines fair discount price
4. **User gets tS tokens** → Immediate liquidity based on market conditions

### **💡 Key Benefits of Real Implementation**
- ✅ **Market-driven pricing** (no artificial rates)
- ✅ **Real slippage** shows actual market depth
- ✅ **True MEV protection** from Shadow DEX features
- ✅ **Genuine DeFi composability** demonstration  
- ✅ **LP fee earnings** for liquidity providers
- ✅ **Honest price discovery** based on time to maturity

### **🔧 Expected Market Behavior**
```
Month 0: vS trades at ~25% of face value (immediate liquidity premium)
Month 3: vS trades at ~50% of face value (halfway point)
Month 6: vS trades at ~70-80% of face value (approaching maturity)
Month 9: vS can be redeemed 1:1 for S tokens on protocol site
```

### **📊 Demo Economics**
- **Initial Pool**: 1000 vS + market-determined tS amount
- **Trading Fee**: 0.3% per trade (standard Shadow DEX fee)
- **Price Discovery**: Pure market-driven (no artificial pegs)
- **User Experience**: Honest about discounts and market risks

### **🎯 Key Messaging for Demo**
1. ✅ **Honest Expectations**: "Market will determine fair discount rate"
2. ✅ **Risk Disclosure**: "Early exit means accepting market discount"
3. ✅ **Value Proposition**: "Immediate liquidity vs 9-month wait"
4. ✅ **Market Efficiency**: "Let traders decide fair pricing"

**The simplified model creates a sustainable, honest market for vesting NFT liquidity! 🚀**

### **🎯 Next Steps**
1. ✅ **Tokens ready** (5000 vS + 1000 tS minted)
2. 🔜 **Create Shadow DEX pool** (20 minutes)
3. 🔜 **Update frontend** to use real Shadow integration
4. 🔜 **Test full flow** end-to-end

**You're 20 minutes away from a fully functional live demo! 🚀** 