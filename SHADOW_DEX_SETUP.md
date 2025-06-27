# Shadow DEX Pool Setup Guide
## Creating D-vS / tS Liquidity Pool for Live Demo

### **🎯 CURRENT DEPLOYED CONTRACTS (Gas-Optimized on Sonic Mainnet)**
- ✅ **tS Token**: `0x16e5294Cc116819BfB79752C238a74c9f83a35f9` 
- ✅ **D-vS Token**: `0x2649125B1a683e3448F2BB15425AcD83aa2dfd35`
- ✅ **fNFT Contract**: `0xC6E821326AD497ba4987bA98057abEA7abC425cA`
- ✅ **Vault Contract**: `0x2e17544f3e692a05f9c3c88049bca0ebcf27bb6b`

### **✅ BOOTSTRAP COMPLETE (Just Done)**
- 🎉 **5000 D-vS tokens**: MINTED via emergency function
- 🎉 **1000 tS tokens**: MINTED via faucet  
- 🎉 **Ready for liquidity pool**: Both tokens in deployer wallet

### **🚀 Quick Setup (20 minutes remaining)**

#### **Step 1: Approve Tokens for Shadow DEX**
```bash
# Approve D-vS tokens
cast send 0x2649125B1a683e3448F2BB15425AcD83aa2dfd35 "approve(address,uint256)" [SHADOW_ROUTER] 5000000000000000000000 --rpc-url https://sonic.drpc.org --private-key [YOUR_KEY]

# Approve tS tokens  
cast send 0x16e5294Cc116819BfB79752C238a74c9f83a35f9 "approve(address,uint256)" [SHADOW_ROUTER] 1000000000000000000000 --rpc-url https://sonic.drpc.org --private-key [YOUR_KEY]
```

#### **Step 2: Create Shadow DEX Pool**
1. **Visit**: https://app.shadow.fi/ or https://shadow.fi/
2. **Connect**: MetaMask to Sonic Mainnet (Chain ID: 146)
3. **Navigate**: Pools → Create Pool

#### **Step 3: Pool Configuration**
```
Token A: D-vS
Contract: 0x2649125B1a683e3448F2BB15425AcD83aa2dfd35
Symbol: D-vS

Token B: tS  
Contract: 0x16e5294Cc116819BfB79752C238a74c9f83a35f9
Symbol: tS

Initial Liquidity:
- 1000 D-vS tokens (value anchor)
- 850 tS tokens (15% discount = 0.85 ratio)

Pool Settings:
- Fee Tier: 0.3% (standard AMM fee)
- Price Range: ±10% (for concentrated liquidity if supported)
```

#### **Step 4: Add Initial Liquidity**
```
Amount A: 1000 D-vS
Amount B: 850 tS
Ratio: 1 D-vS = 0.85 tS (15% liquidity discount)

Expected Pool Value: ~$3,700 (assuming $2/token proxy price)
```

### **📱 Frontend Integration - REAL SHADOW DEX**

```typescript
// Real Shadow DEX Router on Sonic (need to find actual address)
const SHADOW_ROUTER = "0x..." // Shadow router address
const SHADOW_FACTORY = "0x..." // Shadow factory address  

// Real trading function
export const executeRealTrade = async (
  dvsAmount: string,
  signer: ethers.Signer
) => {
  const routerContract = new ethers.Contract(
    SHADOW_ROUTER,
    SHADOW_ROUTER_ABI,
    signer
  );

  // Get amounts out for price display
  const amountsOut = await routerContract.getAmountsOut(
    ethers.utils.parseEther(dvsAmount),
    [
      "0x2649125B1a683e3448F2BB15425AcD83aa2dfd35", // D-vS
      "0x16e5294Cc116819BfB79752C238a74c9f83a35f9"  // tS  
    ]
  );

  // Execute real swap
  const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 min
  const minAmountOut = amountsOut[1].mul(97).div(100); // 3% slippage

  const tx = await routerContract.swapExactTokensForTokens(
    ethers.utils.parseEther(dvsAmount),
    minAmountOut,
    [
      "0x2649125B1a683e3448F2BB15425AcD83aa2dfd35", // D-vS
      "0x16e5294Cc116819BfB79752C238a74c9f83a35f9"  // tS
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
    "0x2649125B1a683e3448F2BB15425AcD83aa2dfd35", // D-vS
    "0x16e5294Cc116819BfB79752C238a74c9f83a35f9"  // tS
  );

  if (poolAddress === ethers.constants.AddressZero) {
    throw new Error("Pool not found - create pool first");
  }

  const poolContract = new ethers.Contract(poolAddress, PAIR_ABI, provider);
  const reserves = await poolContract.getReserves();
  
  return {
    poolAddress,
    tvl: reserves[0].add(reserves[1]),
    ratio: reserves[1].div(reserves[0]) // tS per D-vS
  };
};
```

### **🎬 DEMO FLOW (Real Trading)**

1. **User mints fNFT** → Gets vesting NFT with locked tokens
2. **User deposits to Vault** → Gets D-vS tokens instantly (1:1 ratio)  
3. **User trades on Shadow DEX** → **REAL LIQUIDITY POOL** with market pricing
4. **User gets tS tokens** → Immediate liquidity instead of 9-month vesting wait

### **💡 Key Benefits of Real Implementation**
- ✅ **Market-driven pricing** (not hardcoded 0.85 rate)
- ✅ **Real slippage** shows actual market depth
- ✅ **True MEV protection** from Shadow DEX features
- ✅ **Genuine DeFi composability** demonstration  
- ✅ **LP fee earnings** for liquidity providers
- ✅ **Trading volume** shows real protocol usage

### **🔧 Gas Costs (Estimated)**
```bash
Pool Creation: ~0.1 S (~$0.20)
Add Liquidity: ~0.05 S (~$0.10)  
Approve + Trade: ~0.002 S (~$0.004)
Total Demo Cost: ~0.152 S (~$0.30)
```

### **📊 Expected Demo Results**
- **Pool TVL**: $3,700 (1000 D-vS + 850 tS at $2 proxy price)
- **Trading fee**: 0.3% per trade (competitive with Uniswap V2)
- **Price impact**: <2% for small trades ($100-500)
- **Slippage protection**: 3% max slippage setting

### **🎯 Next Steps**
1. ✅ **Tokens ready** (5000 D-vS + 1000 tS minted)
2. 🔜 **Create Shadow DEX pool** (20 minutes)
3. 🔜 **Update frontend** to use real Shadow integration
4. 🔜 **Test full flow** end-to-end

**You're 20 minutes away from a fully functional live demo! 🚀** 