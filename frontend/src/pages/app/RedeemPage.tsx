import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './RedeemPage.css';

export const RedeemPage: React.FC = () => {
  const isMatured = false; // Mock - will be true at month 9+
  const maturityDate = '15 Apr 2026';
  const backingRatio = 0.976; // Mock - 97.6% backing ratio
  const [redeemAmount, setRedeemAmount] = useState('');
  const userBalance = 12500.75;
  
  const calculateRedemption = (amount: string) => {
    const vsAmount = parseFloat(amount) || 0;
    const grossRedemption = vsAmount * backingRatio; // Pro-rata based on backing
    const redeemFee = grossRedemption * 0.02; // 2% redemption fee
    const sReceived = grossRedemption - redeemFee; // Amount after fee
    return { vsAmount, grossRedemption, redeemFee, sReceived };
  };
  
  const { vsAmount, grossRedemption, redeemFee, sReceived } = calculateRedemption(redeemAmount);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!isMatured) {
    return (
      <div className="page-container-modern">
        {/* Hero Header */}
        <motion.div 
          className="page-hero"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="page-title-modern">Redeem vS Tokens</h1>
          <p className="page-subtitle-modern">
            Convert your vS tokens back to S tokens at maturity
          </p>
        </motion.div>

        {/* Not Available Banner */}
        <motion.div 
          className="not-available-banner"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="not-available-content">
            <div className="not-available-icon">⏰</div>
            <div className="not-available-text">
              <h3>Redemption Coming Soon</h3>
              <p>
                Direct vS → S redemption will be available starting <strong>{maturityDate}</strong> when all fNFTs reach maturity.
              </p>
              <div className="alternative-action">
                <p>Need liquidity now?</p>
                <motion.a 
                  href="/app/trade" 
                  className="trade-link-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Trade vS on Shadow DEX →
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div 
          className="timeline-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h3>Redemption Timeline</h3>
          <div className="timeline">
            <div className="timeline-item completed">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Now</h4>
                <p>Trade vS tokens on Shadow DEX for immediate liquidity</p>
              </div>
            </div>
            <div className="timeline-item upcoming">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>{maturityDate}</h4>
                <p>Direct 1:1 vS → S redemption becomes available</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container-modern">
      {/* Hero Header */}
      <motion.div 
        className="page-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title-modern">Redeem vS Tokens</h1>
        <p className="page-subtitle-modern">
          Convert your vS tokens back to S tokens with 1:1 redemption
        </p>
      </motion.div>
      
      {/* Vault Status */}
      <motion.div 
        className={`vault-status-banner ${backingRatio >= 1.0 ? 'vault-ready' : 'vault-pending'}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="vault-status-content">
          <div className="vault-status-header">
            <div className="vault-status-icon">
              {backingRatio >= 1.0 ? '✅' : '⏳'}
            </div>
            <div>
              <h3>Vault Status</h3>
              <div className="backing-percentage">
                Current Backing: <strong>{(backingRatio * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </div>
          
          <div className="vault-status-description">
            {backingRatio >= 1.0 ? (
              <p>All fNFTs have been harvested. Full 1:1 redemption is now available!</p>
            ) : (
              <p>
                Harvest in progress ({(backingRatio * 100).toFixed(1)}% complete). 
                You'll receive ≈{backingRatio.toFixed(3)} S per vS until harvest finishes.
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Redemption Interface */}
      <motion.div 
        className="redemption-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="redemption-card-modern"
          variants={cardVariants}
        >
          <div className="redemption-header">
            <h2>Redeem vS for S</h2>
            <p>Convert your liquid vS tokens back to S tokens</p>
          </div>

          <div className="redemption-input-section">
            <div className="input-label">
              <span>Amount to Redeem</span>
              <span className="balance-info">Balance: {userBalance.toLocaleString()} vS</span>
            </div>
            
            <div className="redemption-input-group">
              <input 
                type="number" 
                placeholder="0.0" 
                className="redemption-input"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
              />
              <div className="input-actions">
                <div className="token-badge vs-badge">vS</div>
                <button 
                  className="max-button"
                  onClick={() => setRedeemAmount(userBalance.toString())}
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          <div className="redemption-summary-modern">
            <motion.div 
              className="summary-row"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span>vS to Redeem</span>
              <span className="value">{vsAmount.toLocaleString()}</span>
            </motion.div>
            
            <motion.div 
              className="summary-row"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <span>Pro-rata Value ({(backingRatio * 100).toFixed(1)}%)</span>
              <span className="value">{grossRedemption.toFixed(2)}</span>
            </motion.div>
            
            <motion.div 
              className="summary-row fee-row"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span>Protocol Fee (2%)</span>
              <span className="value fee">-{redeemFee.toFixed(2)}</span>
            </motion.div>
            
            <motion.div 
              className="summary-row highlight-row"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <span>S Tokens You Receive</span>
              <span className="value highlight">{sReceived.toFixed(2)} S</span>
            </motion.div>
            
            <motion.div 
              className="summary-row"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span>Estimated Gas</span>
              <span className="value">~0.004 S</span>
            </motion.div>
          </div>

          <motion.button 
            className="redeem-button-modern"
            disabled={!redeemAmount || parseFloat(redeemAmount) <= 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Redeem {vsAmount.toLocaleString()} vS</span>
            <span className="button-arrow">→</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};
