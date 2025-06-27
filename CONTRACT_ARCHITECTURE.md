# Contract Architecture - Simplified & Immutable

## 🔒 **Production Contracts (Immutable)**

### `ImmutableVault.sol`
- **Purpose**: Main vault contract for production deployment
- **Features**: Zero admin control, immutable parameters, pure infrastructure
- **Security**: No owner functions, no pause mechanisms, no upgrade paths
- **Usage**: Mainnet deployment for real Sonic fNFTs

### `ImmutableVSToken.sol`
- **Purpose**: ERC-20 token contract for production deployment  
- **Features**: Zero admin control, immutable minter address
- **Security**: No owner functions, no admin control after deployment
- **Usage**: Mainnet deployment paired with ImmutableVault.sol

## 🧪 **Demo Contracts (Admin Functions)**

### `vSVault.sol` - DEMO ONLY
- **Purpose**: Vault contract for testing and demonstrations
- **Features**: Contains admin functions (pause/unpause, setNFTContract, emergencyMint)
- **Security**: ⚠️ NOT SUITABLE FOR PRODUCTION - has admin control
- **Usage**: Demo environment only, testnet deployment

### `vSToken.sol` - DEMO ONLY  
- **Purpose**: ERC-20 token for testing and demonstrations
- **Features**: Contains admin functions (setMinter, emergencyMint)
- **Security**: ⚠️ NOT SUITABLE FOR PRODUCTION - has admin control
- **Usage**: Demo environment only, paired with vSVault.sol

### `DecayfNFT.sol` - DEMO ONLY
- **Purpose**: Simulates Sonic's vesting NFT mechanics
- **Features**: Demo minting, faucet functionality, owner functions
- **Security**: ⚠️ DEMO ONLY - not a real Sonic contract
- **Usage**: Testing and demonstration purposes

### `MockToken.sol` - DEMO ONLY
- **Purpose**: Simple test token with faucet
- **Features**: Faucet functionality for demo setup
- **Security**: ⚠️ DEMO ONLY - has owner functions
- **Usage**: Testing and demonstration purposes

## 🗑️ **Removed Contracts (Superfluous)**

### Deleted Files:
- `src/Vault.sol` - Old vault implementation, replaced by ImmutableVault.sol
- `src/mapping.ts` - Subgraph mapping, doesn't belong in contracts folder
- `test/Vault.t.sol.bak` - Backup file, not needed
- `test/vSToken.t.sol` - Nearly empty test file

## 📋 **Deployment Strategy**

### Production (Mainnet):
```
1. Deploy ImmutableVSToken.sol with vault address as minter
2. Deploy ImmutableVault.sol with token address and parameters
3. Verify contracts and immutable nature
4. No further admin actions possible
```

### Demo (Testnet):
```
1. Deploy TestSonicToken.sol (demo underlying token)
2. Deploy TestSonicDecayfNFT.sol (demo vesting NFTs)
3. Deploy VSToken.sol (demo vS token)
4. Deploy vSVault.sol (demo vault with admin functions)
5. Configure demo environment for testing
```

## 🔑 **Key Principles**

1. **Clear Separation**: Production contracts have zero admin control
2. **Minimal Complexity**: Only essential functionality in production
3. **Maximum Security**: No rug pull risk, no governance attacks
4. **Honest Labeling**: Demo contracts clearly marked as such
5. **Immutable Infrastructure**: Works forever without intervention

---

**Production = Immutable | Demo = Admin Functions | Simple = Secure** 