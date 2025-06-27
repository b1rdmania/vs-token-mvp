import React from 'react';
import './RedeemPage.css';

export const RedeemPage: React.FC = () => {
  const isMatured = false; // Mock - will be true at month 9+
  const maturityDate = '16 Mar 2026';

  if (!isMatured) {
    return (
      <div className="page-container">
        <h1 className="page-title">Redeem vS for S</h1>
        <div className="info-banner">
          <h2>Redemption Not Yet Available</h2>
          <p>
            vS tokens can be redeemed for S tokens at 1:1 ratio starting <strong>{maturityDate}</strong> when all fNFTs mature.
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
      <div className="success-banner">
        <p>
          <strong>Redemption Available!</strong> All fNFTs have matured. 
          Redeem your vS tokens for S tokens at 1:1 ratio with no penalties.
        </p>
      </div>
      <div className="content-card">
        <h2>Redeem vS for S</h2>
        <div className="redeem-input-container form-group">
          <label>vS to Redeem</label>
          <div className="redeem-input">
            <input type="number" placeholder="0.0" className="form-input" />
            <button className="max-button">MAX</button>
          </div>
          <span>Balance: 12,500.75 vS</span>
        </div>
        <div className="redeem-summary">
          <div><label>S you receive</label><span>0</span></div>
          <div><label>Exchange Rate</label><span>1 vS = 1 S</span></div>
          <div><label>Gas</label><span>~0.004 S</span></div>
        </div>
        <button className="button-primary full-width">Redeem vS for S</button>
      </div>
    </div>
  );
}; 