import React from 'react';
import './PoolPage.css';

const mockPoolStats = {
  tvl: "2,450,000",
  volume24h: "320,540",
  apr: "14.88",
};

const mockUserPosition = {
  lpTokens: "1,250.75",
  poolShare: "0.05",
  value: "1,245.50",
};

export const PoolPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Provide Liquidity</h1>
      <div className="pool-layout">
        <div className="content-card">
          <h2>Add Liquidity</h2>
          <div className="form-group">
            <label htmlFor="vs-amount">vS Amount</label>
            <input id="vs-amount" type="number" placeholder="0.0" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="s-amount">S Amount</label>
            <input id="s-amount" type="number" placeholder="0.0" className="form-input" />
          </div>
          <p className="pool-ratio">1 vS = 1.002 S</p>
          <button className="button-primary" style={{ width: '100%' }}>Provide Liquidity</button>
        </div>

        <div className="pool-stats-container">
          <div className="content-card">
            <h3>Pool Stats</h3>
            <div className="stat-item"><span>Total Liquidity:</span> <strong>$1.2M</strong></div>
            <div className="stat-item"><span>24h Volume:</span> <strong>$150,234</strong></div>
            <div className="stat-item"><span>APR (30d avg):</span> <strong>12.5%</strong></div>
          </div>
          <div className="content-card">
            <h3>My Position</h3>
            <div className="stat-item"><span>My Pool Share:</span> <strong>0.05%</strong></div>
            <div className="stat-item"><span>My Liquidity:</span> <strong>$600.00</strong></div>
            <div className="stat-item"><span>Unclaimed Fees:</span> <strong>$12.34</strong></div>
            <button className="button-primary" style={{ width: '100%', marginTop: '1rem' }} disabled>Claim Fees</button>
          </div>
        </div>
      </div>
    </div>
  );
}; 