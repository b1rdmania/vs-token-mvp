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
  return (
    <div className="page-container">
      <h1 className="page-title">Trade vS</h1>
      <div className="content-card">
        <h2>Swap vS and other assets, powered by Shadow DEX</h2>
        <p>The vS/S pool is the primary market for swapping between the liquid and vesting-locked versions of the Sonic token.</p>
        
        {/* Placeholder for the Shadow DEX swap widget */}
        <div className="shadow-dex-widget-placeholder">
            <p>Shadow DEX Swap Widget Goes Here</p>
        </div>
      </div>
    </div>
  );
}; 