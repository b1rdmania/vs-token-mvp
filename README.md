# vS (vesting Sonic) Protocol

**Transform illiquid fNFTs into liquid DeFi assets.**

## Overview

The vS Protocol enables holders of Sonic fNFTs (vesting NFTs) to unlock immediate liquidity by depositing their fNFTs and receiving tradeable vS tokens representing the full future value.

## How It Works

### 1. **Deposit & Mint** 🏦
- Deposit your Sonic fNFT into the immutable vault
- **Vault automatically delegates claim rights to itself** (ensures 100% claimability)
- Receive vS tokens equal to the fNFT's full maturity value (1:1 ratio)
- Trade vS tokens immediately for liquidity

### 2. **Market Trading** 📈
- vS tokens trade in Shadow DEX pools at market-determined rates
- Early months: ~25% of face value (immediate liquidity premium)
- Approaching maturity: Prices should converge toward full value
- Market determines all pricing - no protocol guarantees

### 3. **Maturity Redemption** 🎯
- **Month 9+**: Redeem vS tokens for S tokens at 1:1 ratio on our site
- First redeemer triggers vault to claim all fNFTs at 0% penalty burn
- **Proportional backing**: If some fNFTs fail to claim, redemption is proportional
- **Backing ratio visible**: UI shows current collateral health

## Key Features

### ✅ **Ultra-Minimal Security**
- **4 core functions**: `deposit`, `claimBatch`, `redeem`, `sweepSurplus`
- **Zero admin controls**: Truly ownerless after deployment
- **Immutable parameters**: No upgrades or parameter changes possible
- **Gas bomb protection**: Bounded batch operations

### ✅ **100% Claiming Success**
- **Self-delegation pattern**: Vault automatically delegates to itself on deposit
- **Attack window closed**: Once vault owns NFT, only vault can change delegation
- **Future-proof**: Permissionless `forceDelegate()` helper for post-upgrade fixes
- **No revocation risk**: Users cannot revoke delegation after deposit

### ✅ **No System Lockup**
- **Proportional redemption**: Always works, even if some NFTs fail to claim
- **Graceful degradation**: 90% successful claims = 90% redemption value
- **Visible backing ratio**: Users can see real-time collateral health
- **No dangerous invariants**: Removed checks that could freeze the system

### ✅ **Economic Honesty**
- **Market-driven pricing**: Shadow DEX determines vS value, not protocol
- **No false promises**: Protocol doesn't guarantee any specific exchange rates
- **Risk transparency**: Users understand they're trading future value for immediate liquidity
- **Fair protocol fees**: 1% on redemption, 0.05% keeper incentives

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Sonic fNFT    │───▶│  ImmutableVault  │───▶│   vS Tokens     │
│  (9mo vesting)  │    │ (auto-delegates) │    │ (tradeable now) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Shadow DEX     │
                       │ (market pricing) │
                       └──────────────────┘
```

## Risk Disclosure

### ⚠️ **Market Risks**
- **No guaranteed pricing**: vS may trade below face value
- **Liquidity risk**: Shadow DEX pools may have limited depth
- **Convergence uncertainty**: Prices may not reach full value by maturity

### ⚠️ **Technical Risks**  
- **Partial claim failures**: If some fNFTs become unclaimable, redemption is proportional
- **Sonic NFT upgrades**: Future changes to fNFT contracts could affect claiming
- **Smart contract risk**: Code is immutable but could contain undiscovered bugs

### ✅ **Mitigations**
- **Proportional redemption**: System never locks up completely
- **Permissionless fixes**: Community can address delegation issues
- **Transparent backing**: Real-time visibility of collateral health
- **Audit-ready code**: Minimal attack surface for thorough security review

## Contract Addresses

### Sonic Mainnet
- **ImmutableVault**: `TBD` (post-audit)
- **vS Token**: `TBD` (post-audit)
- **Sonic fNFT**: `0x888888888889C00c67689029D7856AAC1065eC11`
- **Underlying S**: `0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38`

### Testnet (Demo)
- **Demo Vault**: `0x742d35Cc6634C0532925a3b8D716628c3b2A7d4e`
- **Demo vS Token**: `0x1234567890abcdef1234567890abcdef12345678`

## Security Features

### 🔒 **Immutable Design**
```solidity
// All critical parameters locked forever
ImmutableVSToken public immutable vS;
address public immutable sonicNFT;
address public immutable underlyingToken;
uint256 public immutable maturityTimestamp;
uint256 public immutable vaultFreezeTimestamp;

// NO admin functions, NO upgrades, NO parameter changes
```

### 🛡️ **Self-Delegation Pattern**
```solidity
function deposit(uint256 nftId) external {
    // Pull NFT first
    IERC721(sonicNFT).safeTransferFrom(msg.sender, address(this), nftId);
    
    // Immediately self-delegate (now we own it, so we can)
    _ensureDelegated(nftId);
    
    // Mint vS tokens
    vS.mint(msg.sender, totalValue);
}
```

### ⚖️ **Proportional Redemption**
```solidity
// Always works, even with partial claim failures
uint256 redeemableValue = (amount * availableBalance) / vsTotalSupply;
```

## Usage

### For Users
1. **Get fNFTs**: Acquire Sonic fNFTs through their platform
2. **Deposit**: Call `vault.deposit(nftId)` to get vS tokens
3. **Trade**: Swap vS on Shadow DEX for immediate liquidity
4. **Redeem**: After month 9, redeem vS for S tokens at 1:1 ratio

### For Keepers
1. **Claim batches**: Call `claimBatch(k)` to process k NFTs and earn 0.05% incentives
2. **Monitor health**: Check `getBackingRatio()` for system health
3. **Fix delegation**: Call `forceDelegate([ids])` if needed (permissionless)

### For Developers
```solidity
// Check vault health
uint256 backingRatio = vault.getBackingRatio(); // 18-decimal fixed point
bool isHealthy = backingRatio >= 0.95e18; // 95%+ backing

// Monitor claim progress  
(uint256 processed, uint256 total) = vault.getClaimProgress();
uint256 percentComplete = (processed * 100) / total;
```

## Development

### Build & Test
```bash
# Install dependencies
forge install

# Run tests
forge test -vv

# Run specific test
forge test --match-test testPartialClaimFailureProportionalRedemption -vvv

# Check test coverage
forge coverage
```

### Deploy
```bash
# Deploy to testnet
forge script script/DeployImmutableVault.s.sol --rpc-url $TESTNET_RPC --broadcast

# Verify contracts
forge verify-contract <address> ImmutableVault --chain-id 146
```

## Audit Status

- **Status**: Ready for audit
- **Scope**: `ImmutableVault.sol` + `ImmutableVSToken.sol`
- **Focus Areas**: Self-delegation pattern, proportional redemption, immutability guarantees

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**⚠️ This protocol involves financial risk. Users should understand they're trading future value for immediate liquidity at market-determined rates. Past performance does not guarantee future results.**
