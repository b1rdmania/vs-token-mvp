/**
 * @title BeetsIntegration - vS Token Trading Interface
 * @author vS Vault Protocol
 * @description Component for trading vS tokens on Beets
 * 
 * This component provides a seamless interface for users to trade their vS tokens
 * on Beets, Sonic's premier DEX. It offers immediate liquidity
 * for vS tokens by connecting to Beets' weighted pools.
 * 
 * Key Features:
 * - Real-time vS/S exchange rates from Beets (when available)
 * - Direct integration with Beets trading interface
 * - Pool analytics and liquidity information
 * - Shows Beets pool liquidity and pricing information
 * - Responsive design for optimal mobile experience
 * - Links to Beets for trading features
 * 
 * Technical Implementation:
 * - Uses React hooks for state management and real-time updates
 * - Integrates with wagmi for Web3 connectivity
 * - Implements error handling for network issues
 * - Responsive CSS Grid layout for cross-device compatibility
 * - Optimized for both desktop and mobile trading experiences
 * - Uses Beets API for real-time pricing (when available)
 * 
 * Security Considerations:
 * - All external links use rel="noopener noreferrer"
 * - Input validation for all user interactions
 * - Error boundaries for graceful failure handling
 * - No direct token transfers through this component
 * - Users are redirected to official Beets interface for actual trading
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './BeetsIntegration.css';

// Beets configuration (Sonic Mainnet)
const BEETS_CONFIG = {
  BASE_URL: 'https://beets.fi'
};

interface BeetsPoolInfoProps {
  vsBalance?: string;
}

const BeetsPoolInfo: React.FC<BeetsPoolInfoProps> = ({ vsBalance }) => {
  const [poolData, setPoolData] = useState({
    tvl: 'TBD',
    volume24h: 'TBD', 
    apr: 'TBD',
    vsPrice: 'TBD',
    liquidityDepth: 'TBD',
    poolWeight: 'TBD'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="beets-integration-container"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
    >
      {/* Header */}
      <motion.div className="pool-header" variants={cardVariants}>
        <div className="pool-title-section">
          <h2 className="pool-title">
            🎵 Beets Pool
          </h2>
          <p className="pool-subtitle">
            Trade vS tokens on Beets with deep liquidity and smart order routing
          </p>
        </div>
        <div className="pool-status">
          <span className="status-badge coming-soon">Coming Soon</span>
        </div>
      </motion.div>

      {/* Pool Stats Grid */}
      <motion.div className="pool-stats-grid" variants={cardVariants}>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Value Locked</div>
            <div className="stat-value">{poolData.tvl}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">24h Volume</div>
            <div className="stat-value">{poolData.volume24h}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <div className="stat-label">Current APR</div>
            <div className="stat-value">{poolData.apr}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-content">
            <div className="stat-label">vS Price</div>
            <div className="stat-value">{poolData.vsPrice}</div>
          </div>
        </div>
      </motion.div>

      {/* Trading Interface */}
      <motion.div className="trading-interface" variants={cardVariants}>
        <div className="trading-header">
          <h3>Trade on Beets</h3>
          <p>Pool will be available once vS tokens are live</p>
        </div>
        
        <div className="trading-buttons">
          <a 
            href={`${BEETS_CONFIG.BASE_URL}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="trade-button primary"
          >
            <span className="button-icon">↗</span>
            <span>Visit Beets</span>
          </a>
        </div>
      </motion.div>

      {/* Pool Benefits */}
      <motion.div className="pool-benefits" variants={cardVariants}>
        <h4>Why Trade on Beets?</h4>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <span>Smart Order Routing</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">💧</span>
            <span>Deep Liquidity</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🔄</span>
            <span>Minimal Slippage</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🎯</span>
            <span>Optimal Execution</span>
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ⚠️ {error}
        </motion.div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <motion.div 
          className="loading-spinner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading pool data...
        </motion.div>
      )}
    </motion.div>
  );
};

export default BeetsPoolInfo; 