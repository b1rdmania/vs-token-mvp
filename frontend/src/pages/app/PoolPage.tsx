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
    <div className="pool-page">
      <div className="pool-header">
        <h1>vS / S Liquidity Pool</h1>
        <p className="page-description">
          Provide liquidity to the vS/S pool to earn trading fees and boosted rewards.
        </p>
      </div>

      <div className="pool-layout">
        <div className="provide-liquidity-panel">
          <h3>Provide Liquidity</h3>
          <div className="liquidity-input-group">
            <label>vS Amount</label>
            <input type="number" placeholder="0.0" />
          </div>
          <div className="liquidity-input-group">
            <label>S Amount</label>
            <input type="number" placeholder="0.0" />
          </div>
          <button className="button-primary" disabled>Zap into Pool</button>
          <p className="powered-by">powered by <a href="https://www.shadow.so/" target="_blank" rel="noopener noreferrer">Shadow</a></p>
        </div>

        <div className="pool-stats-container">
          <div className="stat-card">
            <h4>Pool Stats</h4>
            <div className="stat-row">
              <label>TVL</label>
              <span>${mockPoolStats.tvl}</span>
            </div>
            <div className="stat-row">
              <label>24h Volume</label>
              <span>${mockPoolStats.volume24h}</span>
            </div>
            <div className="stat-row">
              <label>APR</label>
              <span>{mockPoolStats.apr}%</span>
            </div>
          </div>
          <div className="stat-card">
            <h4>My Position</h4>
            <div className="stat-row">
              <label>LP Tokens</label>
              <span>{mockUserPosition.lpTokens}</span>
            </div>
            <div className="stat-row">
              <label>Pool Share</label>
              <span>{mockUserPosition.poolShare}%</span>
            </div>
            <div className="stat-row">
              <label>Value</label>
              <span>${mockUserPosition.value}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 