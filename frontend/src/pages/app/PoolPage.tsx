import React from 'react';
import './PoolPage.css';

const mockPoolStats = {
  tvl: "1,234,567",
  volume24h: "256,789",
  apr: "15.7",
};

const mockUserPosition = {
  lpTokens: "1,234.56",
  poolShare: "0.05",
  value: "1,234.56",
};

export const PoolPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="pool-header">
        <h1 className="page-title">vS / S Liquidity Pool</h1>
        <p className="page-description">
          Provide liquidity to the vS/S pool to earn trading fees and boosted rewards.
        </p>
      </div>

      <div className="pool-layout">
        <div className="content-card provide-liquidity-panel">
          <h3>Provide Liquidity</h3>
          <div className="liquidity-input-group form-group">
            <label>vS Amount</label>
            <input type="number" placeholder="0.0" className="form-input" />
          </div>
          <div className="liquidity-input-group form-group">
            <label>S Amount</label>
            <input type="number" placeholder="0.0" className="form-input" />
          </div>
          <button className="button-primary" style={{width: '100%'}} disabled>Zap into Pool</button>
          <p className="powered-by">powered by <a href="https://www.shadow.so/" target="_blank" rel="noopener noreferrer">Shadow</a></p>
        </div>

        <div className="pool-stats-container">
          <div className="content-card stat-card">
            <h4>Pool Stats</h4>
            <div className="stat-row"><label>TVL</label><span>${mockPoolStats.tvl}</span></div>
            <div className="stat-row"><label>24h Volume</label><span>${mockPoolStats.volume24h}</span></div>
            <div className="stat-row"><label>APR</label><span>{mockPoolStats.apr}%</span></div>
          </div>
          <div className="content-card stat-card">
            <h4>My Position</h4>
            <div className="stat-row"><label>LP Tokens</label><span>{mockUserPosition.lpTokens}</span></div>
            <div className="stat-row"><label>Pool Share</label><span>{mockUserPosition.poolShare}%</span></div>
            <div className="stat-row"><label>Value</label><span>${mockUserPosition.value}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}; 