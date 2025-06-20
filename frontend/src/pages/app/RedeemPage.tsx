import React from 'react';

export const RedeemPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Redeem vS</h1>
      <div className="content-card">
        <h2>Burn vS to receive underlying S</h2>
        <div className="redeem-balance">
          <p>Your vS Balance: <strong>12,500.75 vS</strong></p>
        </div>
        <div className="form-group">
          <label htmlFor="redeem-amount">Amount to Redeem</label>
          <input
            id="redeem-amount"
            type="number"
            placeholder="0.0 vS"
            className="form-input"
          />
        </div>
        <div className="redeem-summary">
          <p>You will receive approximately: <strong>0.0 S</strong></p>
          <p className="muted-text">Note: A small redemption fee applies.</p>
        </div>
        <button className="button-primary" style={{ width: '100%', marginTop: '1rem' }}>
          Redeem S
        </button>
      </div>
    </div>
  );
}; 