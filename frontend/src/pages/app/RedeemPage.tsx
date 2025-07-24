import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import './RedeemPage.css';
import { useVSTokenContract } from '../../hooks/useVSTokenContract';
import { useVaultContract } from '../../hooks/useVaultContract';
import { useSonicNFTContract, type SeasonData } from '../../hooks/useSonicNFTContract';

export const RedeemPage: React.FC = () => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [redeemAmount, setRedeemAmount] = useState('');
  
  // Get real contract data
  const { balance: userBalance, isLoadingBalance } = useVSTokenContract();
  const { backingRatio, totalAssets, isLoadingBackingRatio, isLoadingTotalAssets, redeem: vaultRedeem, isRedeeming } = useVaultContract();
  const { season1Data, userNFTs } = useSonicNFTContract();
  
  // Calculate real values
  const realUserBalance = userBalance ? Number(userBalance) / 10**18 : 0;
  const realBackingRatio = backingRatio ? Number(backingRatio) / 10**18 : 1.0;
  const realVaultBalance = totalAssets ? Number(totalAssets) / 10**18 : 0;
  const maturityTimestamp = season1Data ? (season1Data as SeasonData).maturationTime * 1000 : new Date('2026-04-15T00:00:00Z').getTime();
  const isMatured = Date.now() >= maturityTimestamp;
  
  // Calculate overall Season 1 vesting progress (time-based, not user-specific)
  const startTime = season1Data ? (season1Data as SeasonData).startTime : 0;
  const maturationTime = season1Data ? (season1Data as SeasonData).maturationTime : 0;
  const now = Math.floor(Date.now() / 1000);
  
  let vestingProgress = 0;
  if (startTime && maturationTime && startTime < maturationTime) {
    if (now <= startTime) {
      vestingProgress = 0; // Vesting hasn't started yet
    } else if (now >= maturationTime) {
      vestingProgress = 100; // Fully vested
    } else {
      // Calculate overall Season 1 vesting progress
      const totalVestingPeriod = maturationTime - startTime;
      const timeElapsed = now - startTime;
      const calculatedProgress = (timeElapsed / totalVestingPeriod) * 100;
      vestingProgress = Math.min(100, Number(calculatedProgress.toFixed(2)));
    }
  }
  
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
    const grossRedemption = vsAmount * realBackingRatio;
    const redeemFee = grossRedemption * 0.02; // 2% redemption fee
    const sReceived = grossRedemption - redeemFee;
    return { vsAmount, grossRedemption, redeemFee, sReceived };
  };
  
  const { vsAmount, grossRedemption, redeemFee, sReceived } = calculateRedemption(redeemAmount);

  const handleRedeem = () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (vsAmount > 0) {
      const amountInWei = BigInt(Math.floor(vsAmount * 10**18));
      vaultRedeem(amountInWei);
    }
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Format maturation date for display
  const maturationDate = season1Data ? 
    new Date((season1Data as SeasonData).maturationTime * 1000).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : '15 Apr 2026';

  return (
    <div className="page-container-modern">
      {/* Hero Header */}
      <motion.div 
        className="page-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title-modern">1:1 Redemption Opens {maturationDate}</h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
          <strong>1:1 redemption</strong> opens exactly 9 months after your NFT's vesting start date. 
          Until then, you can trade vS on Beets for instant liquidity.
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
            <p className="countdown-date">Date: {maturationDate} • 00:00 UTC</p>
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
          <span className="stat-value">{realBackingRatio.toFixed(2)} S per vS</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Vault Balance</span>
          <span className="stat-value">{realVaultBalance.toLocaleString()} S</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">NFTs Harvested</span>
          <span className="stat-value">Season 1 Active</span>
        </div>
      </motion.div>

      {/* Connection State */}
      {!isConnected && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh' }}>
          <motion.div 
            className="connect-wallet-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: '#fff',
              borderRadius: '18px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              padding: '2.5rem 2rem',
              maxWidth: '350px',
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.2rem',
            }}
          >
            <div className="empty-icon" style={{ fontSize: '2.5rem' }}>🔗</div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: '#222' }}>Connect your wallet</h2>
              <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>Connect to view your vS balance and redeem tokens.</p>
            </div>
            <button
              className="button-primary-modern"
              style={{ marginTop: '1rem', padding: '0.8rem 1.5rem', fontSize: '1.1rem', borderRadius: '8px', fontWeight: 600 }}
              onClick={() => openConnectModal && openConnectModal()}
            >
              Connect Wallet
            </button>
          </motion.div>
        </div>
      )}

      {/* User Balance Display */}
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
                {isLoadingBalance ? 'Loading...' : `${realUserBalance.toLocaleString()} vS`}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Redemption Form - Only show when matured and connected */}
      {isConnected && isMatured && (
        <motion.div 
          className="redemption-form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="redemption-form-card">
            <h3>Redeem vS Tokens</h3>
            <div className="form-group">
              <label>Amount to Redeem</label>
              <input
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="Enter vS amount"
                max={realUserBalance}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
              <button
                onClick={() => setRedeemAmount(realUserBalance.toString())}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.875rem',
                  background: 'none',
                  border: '1px solid #6366f1',
                  color: '#6366f1',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Max
              </button>
            </div>
            
            {vsAmount > 0 && (
              <div className="redemption-preview">
                <div className="preview-row">
                  <span>vS Amount:</span>
                  <span>{vsAmount.toLocaleString()}</span>
                </div>
                <div className="preview-row">
                  <span>Gross Redemption:</span>
                  <span>{grossRedemption.toLocaleString()} S</span>
                </div>
                <div className="preview-row fee-row">
                  <span>Redeem Fee (2%):</span>
                  <span>-{redeemFee.toLocaleString()} S</span>
                </div>
                <div className="preview-row total-row">
                  <span><strong>You Receive:</strong></span>
                  <span><strong>{sReceived.toLocaleString()} S</strong></span>
                </div>
              </div>
            )}
            
            <button
              onClick={handleRedeem}
              disabled={!vsAmount || vsAmount > realUserBalance || isRedeeming}
              className="redeem-button-active"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                background: vsAmount && vsAmount <= realUserBalance ? '#6366f1' : '#94a3b8',
                color: 'white',
                cursor: vsAmount && vsAmount <= realUserBalance ? 'pointer' : 'not-allowed',
                marginTop: '1rem'
              }}
            >
              {isRedeeming ? 'Redeeming...' : 'Redeem vS → S'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {isConnected && (
        <motion.div 
          className="action-buttons-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="action-buttons-row">
            {!isMatured && (
              <div className="button-with-tooltip">
                <button 
                  className="redeem-button-disabled" 
                  disabled={true}
                  title="Opens at maturity"
                >
                  Redeem vS → S (opens at maturity)
                </button>
                <p className="button-caption">Opens at maturity • You'll receive S minus a 2% redeem fee</p>
              </div>
            )}
            
            <div className="button-with-tooltip">
              <a 
                href="https://beets.fi/pools/sonic/v3/0x8C1121B2BFD23ef4e152097C07764D6ad50477B4"
                target="_blank" 
                rel="noopener noreferrer"
                className="button-primary"
                style={{ minWidth: '200px' }}
              >
                Trade vS on Beets ↗
              </a>
              <p className="button-caption">Trade fee 0.25% • opens new tab ↗</p>
            </div>
          </div>
        </motion.div>
      )}

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
              <p>Trade vS on Beets</p>
            </div>
          </div>
          
          <div className="stepper-line"></div>
          
          <div className="stepper-item pending">
            <div className="stepper-dot"></div>
            <div className="stepper-content">
              <h4>{maturationDate}</h4>
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
