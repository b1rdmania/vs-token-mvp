import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './TradePage.css';
import { useVSTokenContract } from '../../hooks/useVSTokenContract';
import { useBeetsPoolLazy } from '../../hooks/useBeetsPool';
import { useAccount } from 'wagmi';

// Simple Skeleton component
const Skeleton = ({ width = 'w-16', height = 'h-6' }: { width?: string; height?: string }) => (
  <div className={`${width} ${height} bg-gray-300 rounded-full animate-pulse`}>
    &nbsp;
  </div>
);

// FAQ data with Beets integration
const faqData = [
  {
    q: "Is this the actual trading interface?",
    a: "No. This page is a shortcut — LP lives on Beets."
  },
  {
    q: "Why provide liquidity?",
    a: "Earn swap fees plus protocol rewards (vS incentives)."
  },
  {
    q: "Impermanent loss?",
    a: "Yes. IL depends on vS-discount drift. Do your own research."
  },
  {
    q: "Do I need this site to LP?",
    a: "No. This page is a shortcut — LP lives on Beets."
  }
];

const heroTitle = "Add liquidity or swap on Beets";
const heroSub = "The vS / S pool will be available on Beets. Stake LP to earn trading fees and protocol incentives, or swap vS ⇄ S at market price.";
const feeBanner = "Mint fee 1% • Redeem fee 2% • LP earns 0.3% per trade";

export const TradePage: React.FC = () => {
  const { isConnected } = useAccount();
  const { balance, isLoadingBalance } = useVSTokenContract();
  const { elementRef, data: poolData, loading: isLoadingPool, error: poolError, hasIntersected } = useBeetsPoolLazy();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="page-container-modern">
      {/* 1. Hero Header */}
      <motion.div 
        className="page-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title-modern">{poolData?.name || 'vS / S Pool'}</h1>
        <p className="page-subtitle-modern">
          {heroSub}
        </p>
      </motion.div>

      {/* 2. Balance Display */}
      {isConnected && (
        <motion.div 
          className="balance-section"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="balance-card">
            <div className="balance-icon">💰</div>
            <div className="balance-content">
              <div className="balance-label">Your vS Balance</div>
              <div className="balance-value">
                {isLoadingBalance ? <Skeleton width="w-24" /> : balance ? `${(Number(balance) / 10**18).toLocaleString()} vS` : '0 vS'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. CTA Row (two buttons) */}
      <motion.div 
        className="cta-section"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="cta-buttons">
          <motion.a 
            href="https://beets.fi/pools/sonic/v3/0x8C1121B2BFD23ef4e152097C07764D6ad50477B4"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Launch Beets</span>
          </motion.a>
          
          <motion.a 
            href="https://beets.fi/pools/sonic/v3/0x8C1121B2BFD23ef4e152097C07764D6ad50477B4"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Visit Beets</span>
          </motion.a>
        </div>
      </motion.div>

      {/* 3. Pool Analytics Grid */}
      <motion.div 
        ref={elementRef}
        className="pool-section-modern"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="pool-header">
          <h2>Pool Analytics</h2>
          {poolError && <p className="error-text">Error loading pool data: {poolError}</p>}
        </div>
        
        <div className="pool-stats-grid">
          <motion.div 
            className="stat-card"
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">TVL</div>
              <div className="stat-value">
                {!hasIntersected || isLoadingPool ? <Skeleton width="w-16" /> : `$${poolData?.tvl || '0'}`}
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">24h Volume</div>
              <div className="stat-value">
                {!hasIntersected || isLoadingPool ? <Skeleton width="w-16" /> : `$${poolData?.volume24h || '0'}`}
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon">🚀</div>
            <div className="stat-content">
              <div className="stat-label">Swap Fee</div>
              <div className="stat-value">
                {!hasIntersected || isLoadingPool ? <Skeleton width="w-12" /> : (poolData?.swapFee ? `${(parseFloat(poolData.swapFee) * 100).toFixed(2)}%` : '0%')}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 4. Mini FAQ (accordion) */}
      <motion.div 
        className="faq-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="faq-container">
          <h3>Quick FAQ</h3>
          <div className="faq-list">
            {faqData.map((item, index) => (
              <motion.div 
                key={index}
                className={`faq-item ${expandedFaq === index ? 'expanded' : ''}`}
                initial={false}
              >
                <button 
                  className="faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span>{item.q}</span>
                  <span className={`faq-icon ${expandedFaq === index ? 'rotated' : ''}`}>
                    ▼
                  </span>
                </button>
                <motion.div 
                  className="faq-answer"
                  initial={false}
                  animate={{ 
                    height: expandedFaq === index ? 'auto' : 0,
                    opacity: expandedFaq === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="faq-answer-content">
                    {item.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 5. Swap Rate Mockups (clean design) */}
      <motion.div 
        className="trading-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <div className="trading-header">
          <h3>Current Swap Rates</h3>
          <p className="trading-subtitle">Visit Beets to see live pricing for vS/S trades</p>
        </div>
        
        <div className="rate-mockups-container">
          {/* vS → S Rate */}
          <motion.div 
            className="rate-mockup-card"
            variants={cardVariants}
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="rate-header">
              <div className="token-pair">
                <span className="token-from">vS</span>
                <span className="arrow">→</span>
                <span className="token-to">S</span>
              </div>
              <div className="rate-value">Live on Beets</div>
            </div>
            <div className="rate-example">
              <span>Trade vS tokens for S tokens at market rate</span>
            </div>
          </motion.div>

          {/* S → vS Rate */}
          <motion.div 
            className="rate-mockup-card"
            variants={cardVariants}
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="rate-header">
              <div className="token-pair">
                <span className="token-from">S</span>
                <span className="arrow">→</span>
                <span className="token-to">vS</span>
              </div>
              <div className="rate-value">Live on Beets</div>
            </div>
            <div className="rate-example">
              <span>Trade S tokens for vS tokens at market rate</span>
            </div>
          </motion.div>
        </div>

        {/* CTA to actual trading */}
        <motion.div 
          className="trade-cta-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <motion.a 
            href="https://beets.fi/pools/sonic/v3/0x8C1121B2BFD23ef4e152097C07764D6ad50477B4"
            target="_blank"
            rel="noopener noreferrer"
            className="trade-now-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Visit Beets</span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* 6. Footer Reminder Banner */}
      <motion.div 
        className="fee-banner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <div className="fee-banner-content">
          {feeBanner}
        </div>
      </motion.div>
    </div>
  );
}; 