# vS Vault: Harvest Strategy

## The Wait-and-Claim Approach

**Core Strategy**: Vault sits on all fNFTs until April 2026 maturity, then claims everything at 0% penalty burn.

### Why This Works

1. **Penalty Burn Avoidance**: Early claiming triggers penalty burns that destroy backing
2. **Perfect 1:1 Backing**: Waiting until maturity preserves every S token
3. **Mathematical Certainty**: 1000 S fNFT → 1000 vS → 1000 S at redemption

## Implementation

### Month-9 Gate Protection
```solidity
function harvestBatch(uint256 k) external nonReentrant {
    require(block.timestamp >= maturityTimestamp, "Too early");
    // Critical: No harvesting before April 2026
}
```

### Batch Processing
```solidity
uint256 public constant MAX_BATCH_SIZE = 20;

function harvestBatch(uint256 k) external nonReentrant {
    require(k <= MAX_BATCH_SIZE, "Batch too large");
    // Process up to 20 NFTs per transaction
}
```

### Retry Logic
```solidity
for (uint256 i = nextClaimIndex; i < heldNFTs.length; i++) {
    try IDecayfNFT(sonicNFT).claimVestedTokens(nftId) {
        totalClaimed += claimed;
    } catch {
        continue; // Skip failed NFTs, process others
    }
}
```

## Timeline

- **July 2025 - March 2026**: Vault accumulates fNFTs, zero claiming
- **April 15, 2026**: Global maturity timestamp reached
- **April 2026+**: Batch harvesting begins (20 NFTs per transaction)
- **Completion**: All successful claims processed, redemption available

## Economic Benefits

1. **Zero Penalty Burns**: Waiting preserves 100% of underlying S tokens
2. **Perfect Backing**: Every vS token backed by exactly 1 S token
3. **Predictable Outcome**: No complex penalty calculations or timing risks

## Operational Considerations

### Gas Costs
- Each batch processes 20 NFTs (~400k gas per batch)
- Keeper incentives (0.05%) cover gas costs
- Community-driven execution (anyone can call)

### Failed NFTs
- Try-catch wrappers prevent system lockup
- Pro-rata redemption handles partial failures gracefully
- Users get proportional share of successfully claimed tokens

### Keeper Incentives
- 0.05% of claimed tokens go to transaction sender
- Self-sustaining system with profit motive for execution
- No reliance on protocol team for operations

## Risk Mitigation

1. **Gas Bomb Protection**: 20 NFT batch limit prevents excessive gas usage
2. **Failure Isolation**: Individual NFT failures don't block others
3. **Proportional Fairness**: Users receive exactly their share of available tokens

---

**The wait-and-claim strategy ensures maximum economic efficiency while maintaining operational simplicity.** 