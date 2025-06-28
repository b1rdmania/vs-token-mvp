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

// FAQ data
const faqData = [
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
    a: "No. This page is a shortcut — LP lives on Shadow DEX."
  }
];

const heroTitle = "Add liquidity or swap on Shadow DEX";
const heroSub = "The vS / S pool lives on Shadow. Stake LP to earn trading fees and protocol incentives, or swap vS ⇄ S at market price.";
const feeBanner = "Mint fee 1% • Redeem fee 2% • LP earns 0.3% per trade";

export const TradePage: React.FC = () => {
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Mock data
  const availableToSell = 512.42;
  const availableToBuy = 4051.89;

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
        <h1 className="page-title-modern">vS / S Pool</h1>
        <p className="page-subtitle-modern">
          {heroSub}
        </p>
      </motion.div>

      {/* 2. CTA Row (two buttons) */}
      <motion.div 
        className="cta-section"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="cta-buttons">
          <motion.a 
            href="https://shadowdex.io/add/vS/S" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cta-button-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Launch Shadow LP</span>
            <span className="external-icon">↗</span>
          </motion.a>
          
          <motion.a 
            href="https://shadowdex.io/swap/vS/S" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cta-button-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Swap on Shadow</span>
            <span className="external-icon">↗</span>
          </motion.a>
        </div>
      </motion.div>

      {/* 3. Pool Analytics Grid */}
      <motion.div 
        className="pool-section-modern"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="pool-header">
          <h2>Pool Analytics</h2>
          <p>Live data from Shadow DEX vS / S pool</p>
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
              <div className="stat-value">${poolData.tvl}</div>
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
              <div className="stat-value">${poolData.volume24h}</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon">💎</div>
            <div className="stat-content">
              <div className="stat-label">7-Day Fees</div>
              <div className="stat-value">${poolData.fees7d}</div>
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
              <div className="stat-label">Current APR</div>
              <div className="stat-value">{poolData.apr}%</div>
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

      {/* 5. Swap Boxes (greyed out with tooltip) */}
      <motion.div 
        className="trading-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <div className="trading-header">
          <h3>Preview Swap Rates</h3>
          <p className="trading-subtitle">Actual swaps take place on Shadow DEX</p>
        </div>
        
        <div className="trade-container-modern">
          {/* Sell vS */}
          <motion.div 
            className="trade-card-modern disabled-card"
            variants={cardVariants}
          >
            <div className="trade-header">
              <h4>Sell vS</h4>
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
                  disabled
                />
                <div className="token-badge vs-badge">vS</div>
              </div>
              
              <div className="balance-row">
                <span>Balance: {availableToSell} vS</span>
                <button className="max-button" disabled>
                  Max
                </button>
              </div>
            </div>

            <div className="trade-details-modern">
              <div className="detail-row">
                <span>You receive</span>
                <span className="value highlight">
                  {sellAmount ? (parseFloat(sellAmount) * parseFloat(poolData.vsPrice)).toFixed(2) : '0.00'} S
                </span>
              </div>
            </div>

            <div className="disabled-overlay">
              <span>Swaps take place on Shadow DEX</span>
            </div>
          </motion.div>

          {/* Swap Arrow */}
          <div className="swap-separator-modern">
            <div className="swap-icon">⇄</div>
          </div>

          {/* Buy vS */}
          <motion.div 
            className="trade-card-modern disabled-card"
            variants={cardVariants}
          >
            <div className="trade-header">
              <h4>Buy vS</h4>
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
                  disabled
                />
                <div className="token-badge s-badge">S</div>
              </div>
              
              <div className="balance-row">
                <span>Balance: {availableToBuy.toLocaleString()} S</span>
                <button className="max-button" disabled>
                  Max
                </button>
              </div>
            </div>

            <div className="trade-details-modern">
              <div className="detail-row">
                <span>You receive</span>
                <span className="value highlight">
                  {buyAmount ? (parseFloat(buyAmount) * parseFloat(poolData.sPrice)).toFixed(2) : '0.00'} vS
                </span>
              </div>
            </div>

            <div className="disabled-overlay">
              <span>Swaps take place on Shadow DEX</span>
            </div>
          </motion.div>
        </div>
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