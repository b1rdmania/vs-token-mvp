# Manual Demo Setup Guide - Complete in 10 Minutes

## **🚨 Issue: Wallet on Wrong Network**
Your demo app is configured for **Sonic Mainnet (Chain ID: 146)** but your wallet might be on **Sonic Testnet (Chain ID: 57054)**.

## **✅ Quick Fixes**

### **Step 1: Switch to Sonic Mainnet**
1. **Open MetaMask/Wallet**
2. **Click network dropdown** (top center)
3. **Select "Sonic Mainnet"** (not Blaze Testnet)
4. **Refresh the demo page**: http://localhost:5173/TestnetDemo

### **Step 2: Deploy Updated Contracts (With Emergency Mint)**
```bash
# Set your private key (replace with actual key)
export PRIVATE_KEY="your_actual_private_key_here"

# Deploy updated contracts with emergency mint function
forge script script/Deploy_vSVault.s.sol --rpc-url https://rpc.soniclabs.com --broadcast --private-key $PRIVATE_KEY

# Note the new contract addresses from output
```

### **Step 3: Emergency Mint D-vS Tokens**
```bash
# Run emergency mint script to get 1000 D-vS tokens
forge script script/EmergencyMint.s.sol --rpc-url https://rpc.soniclabs.com --broadcast --private-key $PRIVATE_KEY
```

### **Step 4: Get tS Tokens**
```bash
# Option A: Use the faucet in your demo app
# - Go to http://localhost:5173/TestnetDemo
# - Click "Get tS from Faucet" (gets 1000 tS)

# Option B: Use forge to call faucet directly
forge script -target-contract MockSToken -sig "faucet()" 0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49 --rpc-url https://rpc.soniclabs.com --broadcast --private-key $PRIVATE_KEY
```

## **🎯 Alternative: Use Existing Contracts**

### **Option 1: Call Emergency Mint on Existing Vault**
The emergency mint function is already added to your vault contract code. You just need to redeploy or call it:

```solidity
// Call on existing vault: 0x37BD20868FB91eB37813648F4D05F59e07A1bcfb
vault.emergencyMint(yourAddress, 1000e18);
```

### **Option 2: Use Cast to Call Function Directly**
```bash
# Emergency mint 1000 D-vS tokens
cast send 0x37BD20868FB91eB37813648F4D05F59e07A1bcfb "emergencyMint(address,uint256)" YOUR_ADDRESS 1000000000000000000000 --rpc-url https://rpc.soniclabs.com --private-key $PRIVATE_KEY
```

## **🚀 Shadow DEX Pool Creation (5 minutes)**

### **After Getting Tokens:**
1. **Go to Shadow DEX**: https://app.shadow.so
2. **Connect wallet** (ensure Sonic Mainnet)
3. **Navigate to "Liquidity"**
4. **Create new pool**: D-vS / tS
   - D-vS Token: `0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031`
   - tS Token: `0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49`
5. **Add liquidity**: 1000 D-vS + 850 tS (15% discount rate)
6. **Confirm transactions**

### **Update Demo App**
Replace the simulated trading with real Shadow DEX integration in `TestnetDemo.tsx`.

## **📋 Verification Checklist**

- [ ] Wallet connected to **Sonic Mainnet (Chain ID: 146)**
- [ ] Contract addresses match mainnet deployment
- [ ] Emergency mint function available on vault
- [ ] 1000+ D-vS tokens in your wallet
- [ ] 850+ tS tokens in your wallet  
- [ ] Shadow DEX pool created and funded
- [ ] Demo app shows real trading interface

## **🆘 Troubleshooting**

### **"Transaction Reverted" Error**
- Check you're the owner of the vault contract
- Verify emergency mint limit (max 50,000 tokens)
- Ensure sufficient gas (S tokens)

### **"Wrong Network" Error**
- MetaMask: Settings → Networks → Add Sonic Mainnet
- Chain ID: 146
- RPC: https://rpc.soniclabs.com
- Currency: S

### **"Insufficient Funds" Error**
- Get S tokens for gas from Sonic faucet
- Bridge from other networks if needed

## **🎯 Expected Result**
After completion:
- **Demo shows**: Real fNFT → D-vS minting on mainnet
- **Shadow DEX shows**: Active D-vS/tS trading pair
- **Users can**: Complete full liquidity unlock flow
- **Total time**: ~15 minutes for complete setup 