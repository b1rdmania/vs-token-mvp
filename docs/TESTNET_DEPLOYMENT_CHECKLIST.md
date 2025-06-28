# Testnet Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Setup
```bash
# Set up testnet environment
export PRIVATE_KEY="your_testnet_private_key"
export RPC_URL="https://rpc.testnet.soniclabs.com"

# Verify testnet S token balance
cast balance $DEPLOYER_ADDRESS --rpc-url $RPC_URL
```

### 2. Update Treasury Address
```solidity
// In script/DeployImmutableVault.s.sol, update:
address constant TREASURY = 0x...;  // Your testnet treasury address
```

## Deployment Process

### 3. Deploy Contracts
```bash
# Deploy to Sonic testnet
forge script script/DeployImmutableVault.s.sol:DeployImmutableVault \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify
```

### 4. Verify Constructor Arguments
Check on Sonic testnet block explorer:
- [ ] `vsToken` = Deployed vS token address
- [ ] `sonicNFT` = `0x146D8C75c0b0E8F0BECaFa5c26C8F7C1b5c2C0B1`
- [ ] `underlyingToken` = `0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38`
- [ ] `treasury` = Your treasury address
- [ ] `maturityTimestamp` = `1756684800` (Oct 1, 2025)
- [ ] `freezeTimestamp` = `1748476800` (Jan 31, 2025)

## Full Lifecycle Testing

### 5. Initial State Verification
```bash
# Check initial state
cast call $VAULT_ADDRESS "totalVSSupply()" --rpc-url $RPC_URL
cast call $VAULT_ADDRESS "totalSBacking()" --rpc-url $RPC_URL
cast call $VAULT_ADDRESS "matured()" --rpc-url $RPC_URL
```

### 6. Deposit Testing
```bash
# Get test fNFT (if available on testnet)
# Approve vault to transfer fNFT
cast send $FNFT_ADDRESS "approve(address,uint256)" $VAULT_ADDRESS $TOKEN_ID --rpc-url $RPC_URL

# Deposit fNFT
cast send $VAULT_ADDRESS "deposit(uint256)" $TOKEN_ID --rpc-url $RPC_URL

# Verify vS tokens minted
cast call $VS_TOKEN_ADDRESS "balanceOf(address)" $YOUR_ADDRESS --rpc-url $RPC_URL
```

### 7. ClaimBatch Testing (Pre-Maturity)
```bash
# Try claimBatch before maturity (should work for any matured fNFTs)
cast send $VAULT_ADDRESS "claimBatch(uint256[])" "[$TOKEN_ID]" --rpc-url $RPC_URL

# Check S backing increased
cast call $VAULT_ADDRESS "totalSBacking()" --rpc-url $RPC_URL
```

### 8. Time Travel to Maturity
```bash
# For testing: advance time to maturity timestamp
# (This requires testnet with time manipulation capabilities)
```

### 9. Post-Maturity Testing
```bash
# Verify maturity state
cast call $VAULT_ADDRESS "matured()" --rpc-url $RPC_URL

# Test redeem functionality
cast send $VAULT_ADDRESS "redeem(uint256)" $VS_AMOUNT --rpc-url $RPC_URL

# Verify S tokens received
cast call $S_TOKEN_ADDRESS "balanceOf(address)" $YOUR_ADDRESS --rpc-url $RPC_URL
```

### 10. Grace Period Testing
```bash
# Advance time past grace period (maturity + 180 days)
# Test sweepSurplus
cast send $VAULT_ADDRESS "sweepSurplus()" --rpc-url $RPC_URL
```

## Gas Cost Analysis

### 11. Record Gas Usage
- [ ] `deposit()` gas cost: _____ gas
- [ ] `claimBatch(1)` gas cost: _____ gas  
- [ ] `claimBatch(20)` gas cost: _____ gas
- [ ] `redeem()` gas cost: _____ gas
- [ ] `sweepSurplus()` gas cost: _____ gas

### 12. Keeper Economics Verification
```bash
# Calculate keeper incentive for batch claim
# Should be: (claimed_amount * 0.05%) = keeper_reward
```

## Edge Case Testing

### 13. Security Scenarios
- [ ] Test zero amount deposit (should revert)
- [ ] Test duplicate token deposit (should revert)
- [ ] Test redeem before maturity (should revert)
- [ ] Test redeem with insufficient balance (should revert)
- [ ] Test sweepSurplus before grace period (should revert)

### 14. Reentrancy Testing
- [ ] Deploy malicious ERC721 receiver
- [ ] Attempt reentrancy attack during deposit
- [ ] Verify ReentrancyGuard protection

## Final Verification

### 15. Contract State Consistency
```bash
# Verify accounting integrity
total_vs_supply=$(cast call $VAULT_ADDRESS "totalVSSupply()" --rpc-url $RPC_URL)
total_s_backing=$(cast call $VAULT_ADDRESS "totalSBacking()" --rpc-url $RPC_URL)
echo "vS Supply: $total_vs_supply"
echo "S Backing: $total_s_backing"
# Should maintain proportional relationship
```

### 16. Documentation Update
- [ ] Record deployed contract addresses
- [ ] Update frontend config with testnet addresses
- [ ] Document any issues or deviations from expected behavior

## Success Criteria
✅ All constructor parameters verified on block explorer  
✅ Full lifecycle completed: deposit → claim → maturity → redeem → sweep  
✅ Gas costs within expected ranges  
✅ All edge cases handled correctly  
✅ No reentrancy vulnerabilities  
✅ Accounting remains consistent throughout  

**Ready for mainnet deployment when all checkboxes are complete.** 