import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './TradePage.css';

// Mock data
const poolData = {
  tvl: "1,250,000",
  volume24h: "150,000",
  fees7d: "2,500",
  apr: "12.5",
  vsPrice: "0.94",
  sPrice: "1.06"
};

export const TradePage: React.FC = () => {
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  
  // Mock data
  const availableToSell = 512.42;
  const availableToBuy = 4051.89;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="page-container-modern">
      {/* Hero Header */}
      <motion.div 
        className="page-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title-modern">Trade vS Tokens</h1>
        <p className="page-subtitle-modern">
          Swap between vS and S tokens. Market-driven pricing, instant liquidity.
        </p>
      </motion.div>

      {/* Trading Interface */}
      <motion.div 
        className="trading-section"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="trade-container-modern">
          {/* Sell vS */}
          <motion.div 
            className="trade-card-modern"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <div className="trade-header">
              <h3>Sell vS</h3>
              <div className="rate-display">1 vS ≈ {poolData.vsPrice} S</div>
            </div>
            
            <div className="trade-input-section">
              <div className="input-group-modern">
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="amount-input-modern" 
                />
                <div className="token-badge vs-badge">vS</div>
              </div>
              
              <div className="balance-row">
                <span>Balance: {availableToSell} vS</span>
                <button className="max-button" onClick={() => setSellAmount(availableToSell.toString())}>
                  Max
                </button>
              </div>
            </div>

            <div className="trade-details-modern">
              <div className="detail-row">
                <span>Slippage</span>
                <span className="value">0.5%</span>
              </div>
              <div className="detail-row">
                <span>You receive</span>
                <span className="value highlight">
                  {sellAmount ? (parseFloat(sellAmount) * parseFloat(poolData.vsPrice)).toFixed(2) : '0.00'} S
                </span>
              </div>
            </div>

            <motion.button 
              className="trade-button-modern disabled"
              disabled
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Sell vS</span>
              <span className="coming-soon">Coming Soon</span>
            </motion.button>
          </motion.div>

          {/* Swap Arrow */}
          <div className="swap-separator-modern">
            <motion.div 
              className="swap-icon"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              ⇄
            </motion.div>
          </div>

          {/* Buy vS */}
          <motion.div 
            className="trade-card-modern"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <div className="trade-header">
              <h3>Buy vS</h3>
              <div className="rate-display">1 S ≈ {poolData.sPrice} vS</div>
            </div>
            
            <div className="trade-input-section">
              <div className="input-group-modern">
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="amount-input-modern" 
                />
                <div className="token-badge s-badge">S</div>
              </div>
              
              <div className="balance-row">
                <span>Balance: {availableToBuy.toLocaleString()} S</span>
                <button className="max-button" onClick={() => setBuyAmount(availableToBuy.toString())}>
                  Max
                </button>
              </div>
            </div>

            <div className="trade-details-modern">
              <div className="detail-row">
                <span>Slippage</span>
                <span className="value">0.5%</span>
              </div>
              <div className="detail-row">
                <span>You receive</span>
                <span className="value highlight">
                  {buyAmount ? (parseFloat(buyAmount) * parseFloat(poolData.sPrice)).toFixed(2) : '0.00'} vS
                </span>
              </div>
            </div>

            <motion.button 
              className="trade-button-modern disabled"
              disabled
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Buy vS</span>
              <span className="coming-soon">Coming Soon</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Pool Stats */}
      <motion.div 
        className="pool-section-modern"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="pool-header">
          <h2>vS / S Pool Analytics</h2>
          <p>Real-time liquidity pool statistics</p>
        </div>
        
        <div className="pool-stats-grid">
          <motion.div 
            className="stat-card"
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Total Value Locked</div>
              <div className="stat-value">${poolData.tvl}</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">24h Volume</div>
              <div className="stat-value">${poolData.volume24h}</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon">💎</div>
            <div className="stat-content">
              <div className="stat-label">7d Fees</div>
              <div className="stat-value">${poolData.fees7d}</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon">🚀</div>
            <div className="stat-content">
              <div className="stat-label">APR</div>
              <div className="stat-value">{poolData.apr}%</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Shadow DEX Integration */}
      <motion.div 
        className="shadow-dex-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <div className="shadow-dex-card">
          <div className="shadow-dex-header">
            <div className="shadow-dex-icon">🌊</div>
            <div>
              <h3>Trade on Shadow DEX</h3>
              <p>Access deeper liquidity and advanced trading features</p>
            </div>
          </div>
          
          <motion.a 
            href="https://shadow.so/swap?from=vS&to=S" 
            target="_blank" 
            rel="noopener noreferrer"
            className="shadow-dex-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Launch Shadow DEX</span>
            <span className="external-icon">↗</span>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};
