# vS Vault Protocol - Audit Package

## Audit Scope: CONTRACT LOGIC ONLY

**What's Frozen**: Contract architecture, fee calculations, security patterns  
**What's Variable**: Deployment addresses and timestamps (injected at deploy time)

## Commit Information
- **Repository**: https://github.com/b1rdmania/vs-token-mvp
- **Commit Hash**: `6317f10f659dfbd8d5cecd08bcbce473dd276d40`
- **Tag**: `v1.0.0-immutable`
- **Date**: January 2025

## Protocol Overview
The vS Vault Protocol enables liquidity for Sonic fNFTs through a simple 4-function immutable vault:

1. **deposit()** - Lock fNFT, mint full-value vS tokens
2. **claimBatch()** - Keeper function to claim matured S tokens
3. **redeem()** - Burn vS tokens for underlying S (post-maturity)
4. **sweepSurplus()** - Cleanup function for unclaimed tokens

## Key Design Principles
- **Immutable**: No admin functions, no upgrades, no pause mechanisms
- **Trustless**: Math-based proportional redemption guarantees
- **Minimal**: 4 functions, single file, minimal dependencies
- **Sonic-Optimized**: Designed for Sonic's low gas costs

## Audit Focus Areas
1. **Economic Security**: Proportional redemption math, surplus handling
2. **Reentrancy**: External calls to fNFT and ERC20 contracts
3. **Edge Cases**: Zero amounts, duplicate deposits, timing attacks
4. **Keeper Incentives**: Gas economics and liveness guarantees

## Files Included
```
/contracts/
  - ImmutableVault.sol     (Main vault contract - 372 lines)
  - ImmutableVSToken.sol   (Simple ERC20 token - 46 lines)

/test/
  - ImmutableVault.t.sol   (12 comprehensive tests)

params.csv                 (Example deployment parameters)
README.md                  (Protocol documentation)
SECURITY_ANALYSIS.md       (Security considerations)
SONIC_GAS_ECONOMICS.md     (Gas cost analysis)
```

## Deployment Parameters (Season-1 TBD)

**FROZEN Constants (in contract code)**:
- **Protocol Fee**: 100 BPS (1.0%)
- **Keeper Fee**: 5 BPS (0.05%)
- **Grace Period**: 180 days
- **Max Batch Size**: 20 NFTs
- **Min NFT Face**: 100 S tokens

**VARIABLE Parameters (injected at deploy)**:
- **Sonic fNFT Contract**: TBD (awaiting Season-1 address from Sonic team)
- **Underlying S Token**: `0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38`
- **Protocol Treasury**: TBD (multisig address)
- **Maturity Timestamp**: TBD (based on Season-1 vesting schedule)
- **Freeze Timestamp**: TBD (when to stop accepting deposits)

## Expected Behavior
- Users deposit Season-1 fNFTs and receive full-value vS tokens immediately
- Keepers claim matured S tokens in batches (incentivized by 0.05% fees)
- At maturity, users can redeem vS for S at proportional ratio
- Surplus S tokens can be swept after 180-day grace period

## Critical Interface Assumptions
The vault expects Season-1 fNFTs to implement:
```solidity
interface IDecayfNFT {
    function claimDelegates(uint256 tokenId) external view returns (address);
    function getTotalAmount(uint256 tokenId) external view returns (uint256);
    function claimable(uint256 tokenId) external view returns (uint256);
    function claimVestedTokens(uint256 tokenId) external returns (uint256);
    function setDelegate(uint256 tokenId, address delegate) external;
}
```

**Interface compatibility will be verified before mainnet deployment.**

## Deployment Process
1. **Audit contract logic** (this package)
2. **Obtain Season-1 fNFT details** from Sonic team
3. **Inject real parameters** via environment variables
4. **Deploy with frozen contract code** + real parameters

## Contact
For questions during audit: [contact information]

---

**This package contains the final contract logic. No code changes will be made post-audit - only parameter injection at deployment time.** 