import React from 'react';
import './RedeemPage.css';

export const RedeemPage: React.FC = () => {
  const penalty = 42; // Mock penalty

  return (
    <div className="redeem-page">
      {penalty > 0 && (
        <div className="warning-banner">
          <p>
            <strong>Redeeming early burns part of your vest.</strong> Current penalty {penalty}%.
            Wait until 16 Mar 2026 for zero penalty.
          </p>
        </div>
      )}
      <div className="redeem-form card-style">
        <h3>Redeem vS for S</h3>
        <div className="redeem-input-container">
          <label>vS to Burn</label>
          <div className="redeem-input">
            <input type="number" placeholder="0.0" />
            <button className="max-button">MAX</button>
          </div>
          <span>Balance: 12,500.75 vS</span>
        </div>
        <div className="redeem-summary">
          <div>
            <label>S you receive now</label>
            <span>0</span>
          </div>
          <div>
            <label>Penalty burn ({penalty}%)</label>
            <span>0 S</span>
          </div>
          <div>
            <label>Gas</label>
            <span>~0.004 S</span>
          </div>
        </div>
        <button className="button-primary full-width">Redeem & Burn</button>
      </div>
    </div>
  );
}; 