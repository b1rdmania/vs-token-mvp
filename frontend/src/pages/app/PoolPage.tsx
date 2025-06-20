import React from 'react';
import './PoolPage.css';

export const PoolPage: React.FC = () => {
  return (
    <div className="pool-page">
      <h1>vS / S Liquidity Pool</h1>
      <p className="page-description">
        To ensure deep liquidity and the best trading experience, the primary vS/S liquidity pool will be hosted on a leading decentralized exchange (DEX) on the Sonic network.
      </p>

      <div className="pool-strategy-card">
        <h2>Our Strategy</h2>
        <ul>
          <li>
            <strong>External DEX Integration:</strong> We will leverage the infrastructure and user base of a major Sonic DEX (e.g., Shadow Exchange) rather than building our own. This prevents fragmented liquidity and ensures vS is available where users are already trading.
          </li>
          <li>
            <strong>Incentivized Liquidity:</strong> We are actively exploring a "boosted APR" model with ecosystem partners. The goal is to provide attractive, sustainable yield for users who provide liquidity to the vS/S pool.
          </li>
          <li>
            <strong>Future Integration:</strong> This page will serve as the hub for adding liquidity directly to the pool once the program is live. Stay tuned for announcements.
          </li>
        </ul>
      </div>

      <div className="zap-card">
        <h2>1-Click Zap</h2>
        <p>Easily add liquidity to the vS/S pool.</p>
        <button className="button-primary" disabled>Zap into Pool</button>
        <p className="powered-by">powered by <a href="https://www.shadow.so/" target="_blank" rel="noopener noreferrer">Shadow</a></p>
      </div>
    </div>
  );
}; 