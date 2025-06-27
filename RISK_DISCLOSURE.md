# vS Protocol Risk Disclosure

## ⚠️ **Important: Read Before Using vS Protocol**

**This document outlines the key risks of depositing fNFTs and trading vS tokens. By using the protocol, you acknowledge understanding these risks.**

---

## **1. Market Price Risk**

### **vS Tokens Trade at Discount**
- **Your vS tokens will likely trade below face value** (e.g., 1000 vS tokens may only sell for 250-750 S tokens)
- **The market determines pricing**, not the protocol
- **Discounts can be volatile** and may increase or decrease unpredictably
- **No guarantee of price recovery** even as maturity approaches

### **Example Scenario**
- You deposit a 1000 S fNFT → Get 1000 vS tokens
- You immediately sell vS tokens → Receive ~250 S tokens (75% discount)
- **You lose 750 S tokens in exchange for immediate liquidity**

---

## **2. Liquidity Pool Risks**

### **Impermanent Loss**
- If you provide liquidity to vS/S pools, you face **impermanent loss**
- As vS price changes relative to S, your LP position value changes
- **You may receive fewer tokens back** than you originally deposited

### **Pool Liquidity Crunch**
- **Months 6-9 may see reduced liquidity** as buyers become scarce
- Near maturity, few people want to buy vS at high prices
- **You may not be able to sell** your vS tokens at favorable prices

---

## **3. Redemption Window Risk**

### **Limited Grace Period**
- **180-day redemption window** after maturity (Month 9-15)
- If you don't redeem within this window, **your S tokens are swept to treasury**
- **No extensions or exceptions** - this is permanent

### **Gas Costs**
- Redemption requires blockchain transactions with gas fees
- **High gas periods may make small redemptions uneconomical**
- Plan for gas costs when deciding redemption timing

---

## **4. Smart Contract Risks**

### **Code Risk**
- Smart contracts may contain **bugs or vulnerabilities**
- **Funds could be lost** due to coding errors or exploits
- Even audited contracts carry residual risk

### **Immutable Design**
- Vault contracts are **immutable** - no upgrades possible
- If issues are discovered, **they cannot be fixed**
- This design choice prioritizes decentralization over flexibility

---

## **5. Regulatory Risk**

### **Changing Laws**
- **Cryptocurrency regulations may change** in your jurisdiction
- New laws could **restrict your ability** to use the protocol
- **Tax implications** may be complex and subject to change

---

## **6. Operational Risks**

### **Frontend Risks**
- **Website may become unavailable** due to technical issues
- You can still interact with contracts directly via Etherscan
- **Always verify contract addresses** before interacting

### **Oracle/Price Feed Risks**
- Protocol relies on **external price data**
- Price feed failures could **impact trading or redemption**

---

## **7. Economic Model Risks**

### **First Season Experiment**
- This is the **first implementation** of the vS model
- **User behavior may be unpredictable**
- Market dynamics could evolve differently than expected

### **No Yield Generation**
- vS tokens **do not generate yield** while held
- Opportunity cost of **not earning on other investments**

---

## **8. Counterparty Risks**

### **Shadow DEX Dependency**
- Trading relies heavily on **Shadow DEX liquidity**
- If Shadow DEX faces issues, **trading may be impacted**
- **No guaranteed alternative trading venues**

### **Treasury Management**
- Protocol treasury decisions **may affect your interests**
- Treasury-controlled funds could be **managed differently than expected**

---

## **Risk Mitigation Strategies**

### **For Users**
- ✅ **Only deposit what you can afford to lose**
- ✅ **Understand the discount before depositing**
- ✅ **Set calendar reminders** for redemption window
- ✅ **Keep some ETH/S for gas costs**
- ✅ **Diversify across multiple protocols/strategies**

### **For Liquidity Providers**
- ✅ **Understand impermanent loss mechanics**
- ✅ **Monitor pool health regularly**
- ✅ **Have exit strategy prepared**

---

## **Emergency Procedures**

### **If Website is Down**
- Contract addresses: [To be filled with mainnet addresses]
- Interact directly via Etherscan "Write Contract" section
- Always verify you're on the correct contract

### **If You Need Help**
- Community Discord: [To be filled]
- Documentation: [To be filled]
- **Never share private keys or seed phrases**

---

## **Legal Disclaimer**

- **This protocol is experimental software**
- **No warranties or guarantees** of any kind
- **Use at your own risk**
- **Past performance does not predict future results**
- **Consult financial/legal advisors** before making significant investments

---

## **Acknowledgment**

By using the vS protocol, you confirm that you:
- ✅ Have read and understood all risks outlined above
- ✅ Are legally permitted to use cryptocurrency protocols in your jurisdiction
- ✅ Are not relying on any promises of returns or guarantees
- ✅ Understand that all losses are your responsibility

**Last Updated**: [Date]
**Version**: 1.0 