import React from 'react';
import './TradePage.css';

// Mock data
const poolData = {
  tvl: "1,250,000",
  volume24h: "150,000",
  fees7d: "1,200",
  apr: "15.75"
};

export const TradePage: React.FC = () => {
  // Mock data based on the brief
  const availableToSell = 512.42;
  const availableToBuy = 4051.89;

  return (
    <div className="trade-page">
      <h1>Trade</h1>
      <p>Trade vS tokens for S tokens and vice-versa. The exchange rate is determined by the live penalty curve.</p>
      <div className="trade-container">
        <div className="trade-box">
          <h2>Sell vS</h2>
          <div className="trade-input">
            <input type="number" placeholder="0.0" />
            <div className="token-select">vS</div>
          </div>
          <div className="trade-details">
            <div>
              <span>Balance: {availableToSell} vS</span>
              <button className="button-link">Max</button>
            </div>
            <div>
              <span>Slippage</span>
              <a href="#">0.5%</a>
            </div>
            <div>
              <span>Rate</span>
              <span>1 vS ≈ 0.94 S</span>
            </div>
          </div>
          <button className="button-primary" disabled>Sell vS (Coming Soon)</button>
        </div>

        <div className="trade-separator">⇄</div>

        <div className="trade-box">
          <h2>Buy vS</h2>
          <div className="trade-input">
            <input type="number" placeholder="0.0" />
            <div className="token-select">S</div>
          </div>
          <div className="trade-details">
            <div>
              <span>Balance: {availableToBuy} S</span>
              <button className="button-link">Max</button>
            </div>
            <div>
              <span>Slippage</span>
              <a href="#">0.5%</a>
            </div>
            <div>
              <span>Rate</span>
              <span>1 S ≈ 1.06 vS</span>
            </div>
          </div>
          <button className="button-primary" disabled>Buy vS (Coming Soon)</button>
        </div>
      </div>
      
      {/* Pool Panel */}
      <div className="pool-panel card-style">
        <h3>vS / S Pool</h3>
        <div className="pool-stats">
          <div><label>TVL</label><span>${poolData.tvl}</span></div>
          <div><label>24h Volume</label><span>${poolData.volume24h}</span></div>
          <div><label>7d Fees</label><span>${poolData.fees7d}</span></div>
          <div><label>APR</label><span>{poolData.apr}%</span></div>
        </div>
      </div>
    </div>
  );
}; 