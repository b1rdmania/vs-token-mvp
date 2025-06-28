import React from 'react';
import './RedeemPage.css';

export const RedeemPage: React.FC = () => {
  const isMatured = false; // Mock - will be true at month 9+
  const maturityDate = '15 Apr 2026';
  const backingRatio = 0.976; // Mock - 97.6% backing ratio
  const [redeemAmount, setRedeemAmount] = React.useState('');
  
  const calculateRedemption = (amount: string) => {
    const vsAmount = parseFloat(amount) || 0;
    const grossRedemption = vsAmount * backingRatio; // Pro-rata based on backing
    const redeemFee = grossRedemption * 0.02; // 2% redemption fee
    const sReceived = grossRedemption - redeemFee; // Amount after fee
    return { vsAmount, grossRedemption, redeemFee, sReceived };
  };
  
  const { vsAmount, grossRedemption, redeemFee, sReceived } = calculateRedemption(redeemAmount);

  if (!isMatured) {
    return (
      <div className="page-container">
        <h1 className="page-title">Redeem vS for S</h1>
        <div className="info-banner">
          <h2>Redemption Not Yet Available</h2>
          <p>
            vS tokens can be redeemed for S tokens (minus 2% protocol fee) starting <strong>{maturityDate}</strong> when all fNFTs mature.
          </p>
          <p>
            Until then, you can trade your vS tokens for immediate liquidity on the <strong>Trade</strong> page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Redeem vS for S</h1>
      
      {/* Backing Ratio Status */}
      <div className={`info-banner ${backingRatio >= 1.0 ? 'success-banner' : ''}`}>
        <h3>Vault Status</h3>
        <p>
          <strong>Current Backing: {(backingRatio * 100).toFixed(1)}%</strong>
        </p>
        {backingRatio >= 1.0 ? (
          <p>✅ All fNFTs harvested. Full 1:1 redemption available.</p>
        ) : (
          <p>
            ⏳ Harvest in progress ({(backingRatio * 100).toFixed(1)}% complete). 
            You'll receive ≈{backingRatio.toFixed(3)} S per vS until harvest finishes.
          </p>
        )}
      </div>

      <div className="content-card">
        <h2>Redeem vS for S</h2>
        <div className="redeem-input-container form-group">
          <label>vS to Redeem</label>
          <div className="redeem-input">
            <input 
              type="number" 
              placeholder="0.0" 
              className="form-input"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
            />
            <button className="max-button">MAX</button>
          </div>
          <span>Balance: 12,500.75 vS</span>
        </div>
        <div className="redeem-summary">
          <div><label>vS to redeem</label><span>{vsAmount.toLocaleString()}</span></div>
          <div><label>Pro-rata value ({(backingRatio * 100).toFixed(1)}%)</label><span>{grossRedemption.toLocaleString()}</span></div>
          <div><label>Protocol fee (2%)</label><span className="fee-amount">-{redeemFee.toLocaleString()}</span></div>
          <div><label>S you receive</label><span className="receive-amount">{sReceived.toLocaleString()}</span></div>
          <div><label>Gas</label><span>~0.004 S</span></div>
        </div>
        <button className="button-primary full-width">Redeem vS for S</button>
      </div>
    </div>
  );
}; 