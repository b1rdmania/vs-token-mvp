# vS Vault — Immediate Action Plan

## 🚨 **Critical Gaps Requiring Immediate Action**

Based on comprehensive health check analysis, these 5 items have **highest impact, lowest effort** and must be completed before launch:

### **1. Lock Exact Mint Buffer % (CRITICAL)**
**Status**: ❌ **Missing - No POL/buffer mechanism implemented**
**Impact**: High - Liquidity bootstrapping failure
**Effort**: Low - Documentation + simple treasury policy

**Action Required**:
- [ ] Decide exact buffer percentage (recommend 3-5%)
- [ ] Document treasury fNFT allocation for POL seeding
- [ ] Write treasury policy for POL addition/removal
- [ ] Publish buffer % publicly for transparency

**Deliverable**: `POL_STRATEGY.md` with exact percentages and treasury policy

---

### **2. Finalize Shadow Gauge Deal (CRITICAL)**
**Status**: ❌ **Missing - No confirmed gauge partnership**
**Impact**: High - Launch liquidity depends on this
**Effort**: Low - Business negotiation

**Action Required**:
- [ ] Lock in Shadow DEX gauge dates and emission amounts
- [ ] Get written confirmation of gauge support
- [ ] Prepare backup "self-bribe" plan with treasury funds
- [ ] Set contingency timeline if gauge delayed

**Deliverable**: Signed agreement or backup plan with budget allocation

---

### **3. Add Gas Refund for First Redeemer (MEDIUM)**
**Status**: ⚠️ **Partially implemented - Has keeper incentive but no first-redeemer refund**
**Impact**: Medium - UX improvement, prevents first-mover disadvantage
**Effort**: Low - Simple contract modification

**Current Code**: Already has `KEEPER_INCENTIVE_BPS = 5` for claiming
**Missing**: Gas refund specifically for first redeemer who triggers `claimAll()`

**Action Required**:
```solidity
// Add to redeem() function
if (!matured) { 
    require(block.timestamp >= MATURITY_TS, "not mature");
    uint256 gasBefore = gasleft();
    _claimAll();
    uint256 gasUsed = gasBefore - gasleft();
    uint256 gasRefund = gasUsed * tx.gasprice;
    if (gasRefund > 0 && address(this).balance >= gasRefund) {
        payable(msg.sender).transfer(gasRefund);
    }
    matured = true; 
}
```

**Deliverable**: Updated `vSVault.sol` with gas refund mechanism

---

### **4. Write Risk Disclosure One-Pager (CRITICAL)**
**Status**: ❌ **Missing - No user risk documentation**
**Impact**: High - Regulatory compliance, user protection
**Effort**: Low - Documentation only

**Action Required**:
- [ ] Create `RISK_DISCLOSURE.md` covering:
  - vS discount volatility (market-driven pricing)
  - LP impermanent loss risks
  - 180-day grace period expiry
  - No protocol guarantees on pricing
  - Smart contract risks

**Deliverable**: Plain-English risk sheet for frontend integration

---

### **5. Book Audit Slot + Prep Fuzz Tests (HIGH)**
**Status**: ❌ **Missing - No audit scheduled**
**Impact**: High - Security foundation for launch
**Effort**: Medium - Requires scheduling and test setup

**Action Required**:
- [ ] Contact audit firms (Cyfrin, Code4rena, Sherlock)
- [ ] Get quotes and timeline estimates
- [ ] Prepare comprehensive test suite using Foundry fuzzing
- [ ] Set up property-based testing for invariants

**Existing Foundation**: Already has OpenZeppelin test patterns in `lib/openzeppelin-contracts/lib/erc4626-tests/`

**Deliverable**: Audit booking confirmation + enhanced test suite

---

## **Secondary Priorities (Post-Launch)**

### **Analytics & Monitoring**
- [ ] Subgraph for total vS supply, pool depth, mint/burn events
- [ ] Time-to-maturity countdown dashboard
- [ ] Real-time discount tracking

### **UX Enhancements**
- [ ] Maturity countdown timer in frontend
- [ ] Redemption window alerts
- [ ] Bulk-redeem zap contracts for dust wallets

### **Governance Clarity**
- [ ] Document who controls sweep address
- [ ] Clarify POL removal permissions
- [ ] Fee distribution policy (burn %, dev %, future bribes %)

### **Future Seasons Planning**
- [ ] Season-2 vault strategy (new vault vs reuse)
- [ ] Cross-collateral confusion prevention
- [ ] Multi-season user experience

---

## **Success Metrics**

### **Pre-Launch Checklist**
- [ ] All 5 critical items completed
- [ ] Audit scheduled or completed
- [ ] Risk disclosure published
- [ ] Shadow gauge deal confirmed
- [ ] POL strategy documented

### **Launch Readiness Indicators**
- [ ] >$100K initial liquidity committed
- [ ] Gas refund mechanism tested
- [ ] Risk disclosure integrated in frontend
- [ ] Backup liquidity plan activated if needed

---

## **Timeline Recommendation**

**Week 1**: Items 1, 2, 4 (documentation and partnerships)
**Week 2**: Items 3, 5 (technical implementation and audit booking)
**Week 3**: Integration testing and final preparations
**Week 4**: Launch readiness review

**Total Estimated Time**: 2-3 weeks to close all critical gaps

Once these 5 items are completed, the vS protocol will have closed every major blind spot and be ready for secure launch. 