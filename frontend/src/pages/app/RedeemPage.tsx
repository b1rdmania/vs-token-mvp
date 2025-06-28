import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './RedeemPage.css';

export const RedeemPage: React.FC = () => {
  const isMatured = false; // Mock - will be true at month 9+
  const maturityTimestamp = new Date('2026-04-15T00:00:00Z').getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [redeemAmount, setRedeemAmount] = useState('');
  
  // Mock data following the design critique
  const userBalance = 12500.75;
  const backingRatio = 1.00; // 1.00 S per vS at maturity
  const vaultBalance = 2847650; // Total S in vault
  const nftsProcessed = 1812;
  const totalNfts = 2000;
  const vestingProgress = 22; // 22% of vesting period complete
  
  // Countdown timer effect
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const difference = maturityTimestamp - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes });
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [maturityTimestamp]);

  const calculateRedemption = (amount: string) => {
    const vsAmount = parseFloat(amount) || 0;
    const grossRedemption = vsAmount * backingRatio;
    const redeemFee = grossRedemption * 0.02; // 2% redemption fee
    const sReceived = grossRedemption - redeemFee;
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

  return (
    <div className="page-container-modern">
      {/* Hero Header */}
      <motion.div 
        className="page-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title-modern">1:1 Redemption Opens 15 Apr 2026</h1>
        <p className="page-subtitle-modern">
          Direct vS → S swaps unlock as soon as every fNFT reaches 0% penalty. 
          Until then, you can trade vS on Shadow DEX for instant liquidity.
        </p>
      </motion.div>

      {/* Countdown & Progress Card */}
      <motion.div 
        className="countdown-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="countdown-content">
          <div className="countdown-icon">🕒</div>
          <div className="countdown-text">
            <h3>1:1 Redemption opens in</h3>
            <div className="countdown-timer">
              <span className="time-block">
                <span className="time-number">{timeLeft.days}</span>
                <span className="time-label">days</span>
              </span>
              <span className="time-block">
                <span className="time-number">{timeLeft.hours}</span>
                <span className="time-label">hrs</span>
              </span>
              <span className="time-block">
                <span className="time-number">{timeLeft.minutes}</span>
                <span className="time-label">min</span>
              </span>
            </div>
            <p className="countdown-date">Date: 15 Apr 2026 • 00:00 UTC</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${vestingProgress}%` }}
            ></div>
          </div>
          <p className="progress-text">{vestingProgress}% of vesting complete</p>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div 
        className="stats-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="stat-item">
          <span className="stat-label">Backing</span>
          <span className="stat-value">{backingRatio.toFixed(2)} S per vS</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Vault Balance</span>
          <span className="stat-value">{vaultBalance.toLocaleString()} S</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">NFTs Harvested</span>
          <span className="stat-value">{nftsProcessed}/{totalNfts}</span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="action-buttons-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="action-buttons-row">
          <div className="button-with-tooltip">
            <button 
              className="redeem-button-disabled" 
              disabled={!isMatured}
              title="Opens at maturity"
            >
              Redeem vS → S (soon)
            </button>
            {!isMatured && (
              <p className="button-caption">Opens at maturity • You'll receive S minus a 2% redeem fee</p>
            )}
          </div>
          
          <div className="button-with-tooltip">
            <a 
              href="https://dex.shadow.xyz/pool/vS-S" 
              target="_blank" 
              rel="noopener noreferrer"
              className="trade-button-secondary"
            >
              Trade vS on Shadow ↗
            </a>
            <p className="button-caption">Trade fee 0.25% • opens new tab ↗</p>
          </div>
        </div>
      </motion.div>

      {/* Redemption Timeline (Vertical Stepper) */}
      <motion.div 
        className="timeline-section-modern"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <h3>Redemption Timeline</h3>
        <div className="vertical-stepper">
          <div className="stepper-item active">
            <div className="stepper-dot filled"></div>
            <div className="stepper-content">
              <h4>Now</h4>
              <p>Trade vS on Shadow DEX</p>
            </div>
          </div>
          
          <div className="stepper-line"></div>
          
          <div className="stepper-item pending">
            <div className="stepper-dot"></div>
            <div className="stepper-content">
              <h4>15 Apr 2026</h4>
              <p>Vault harvests NFTs (0% penalty)</p>
            </div>
          </div>
          
          <div className="stepper-line"></div>
          
          <div className="stepper-item pending">
            <div className="stepper-dot"></div>
            <div className="stepper-content">
              <h4>Harvest + 1h</h4>
              <p>1:1 redemption live (−2% fee)</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
