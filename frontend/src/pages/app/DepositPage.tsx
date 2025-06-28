import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import './DepositPage.css';

interface Nft {
  id: number;
  lockedAmount: number;
  vestingEndDate: string;
}

// Mock data for simplified model
const mockNfts: Nft[] = [
  {
    id: 1234,
    lockedAmount: 4800,
    vestingEndDate: '15 Apr 2026',
  },
  {
    id: 5678,
    lockedAmount: 10000,
    vestingEndDate: '15 Apr 2026',
  },
];

const DepositModal = ({ nft, onClose }: { nft: Nft; onClose: () => void }) => {
  const mintFee = Math.floor(nft.lockedAmount * 0.01); // 1% mint fee
  const userReceives = nft.lockedAmount - mintFee; // Amount after fee
  
  return (
    <motion.div 
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="modal-content modern-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        <div className="modal-header">
          <h2>Deposit NFT #{nft.id}</h2>
          <p>Transform your locked fNFT into liquid vS tokens instantly</p>
        </div>
        
        <motion.div 
          className="modal-warning modern-warning"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="warning-icon">⚠️</div>
          <div>
            <strong>Permanent Conversion</strong>
            <p>Your fNFT will be irreversibly converted to liquid vS tokens</p>
          </div>
        </motion.div>
        
        <div className="modal-details modern-details">
          <motion.div 
            className="detail-row"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span>fNFT Value</span>
            <strong className="value-highlight">{nft.lockedAmount.toLocaleString()} S</strong>
          </motion.div>
          <motion.div 
            className="detail-row fee-row"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <span>Protocol Fee (1%)</span>
            <strong className="fee-amount">-{mintFee.toLocaleString()} S</strong>
          </motion.div>
          <motion.div 
            className="detail-row highlight-row"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span>vS Tokens You Receive</span>
            <strong className="vs-amount">{userReceives.toLocaleString()} vS</strong>
          </motion.div>
          <motion.div 
            className="detail-row"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <span>Estimated Gas</span>
            <strong>~0.005 S</strong>
          </motion.div>
        </div>
        
        <div className="modal-actions">
          <button className="button-secondary-modern" onClick={onClose}>Cancel</button>
          <motion.button 
            className="button-primary-modern"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Confirm Deposit
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const DepositPage: React.FC = () => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [selectedNft, setSelectedNft] = useState<Nft | null>(null);

  const handleDepositClick = (nft: Nft) => {
    if (!isConnected) {
      openConnectModal?.();
    } else {
      setSelectedNft(nft);
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

  return (
    <div className="page-container-modern">
      {/* Hero Header */}
      <motion.div 
        className="page-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title-modern">Your fNFTs</h1>
        <p className="page-subtitle-modern">
          Transform locked tokens into liquid DeFi opportunities. Deposit → Mint → Trade.
        </p>
      </motion.div>
      
      {/* Warning Banner */}
      <motion.div 
        className="warning-banner-modern"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="warning-content">
          <div className="warning-header">
            <div className="warning-icon-large">🔄</div>
            <div>
              <h3>Permanent Conversion</h3>
              <p>Your fNFT becomes liquid vS tokens with these benefits:</p>
            </div>
          </div>
          <div className="benefits-grid-compact">
            <div className="benefit-item">
              <span className="benefit-icon">🎯</span>
              <span>1:1 redemption at maturity</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💧</span>
              <span>Fully liquid & tradeable</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🧩</span>
              <span>DeFi-ready collateral</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {!isConnected && (
        <motion.div 
          className="demo-banner-modern"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="demo-icon">🔗</div>
          <div>
            <strong>Demo Mode</strong>
            <p>Connect your wallet to see your actual fNFTs</p>
          </div>
        </motion.div>
      )}

      {/* NFT Grid */}
      <motion.div 
        className="nft-grid-modern"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockNfts.map((nft, index) => {
          const mintFee = Math.floor(nft.lockedAmount * 0.01);
          const userReceives = nft.lockedAmount - mintFee;
          
          return (
            <motion.div 
              key={nft.id} 
              className="nft-card-modern"
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="nft-header">
                <div className="nft-id">#{nft.id}</div>
                <div className="nft-badge">fNFT</div>
              </div>
              
              <div className="nft-value-display">
                <div className="locked-amount">
                  <span className="amount">{nft.lockedAmount.toLocaleString()}</span>
                  <span className="token">S</span>
                </div>
                <div className="conversion-arrow">↓</div>
                <div className="vs-amount">
                  <span className="amount">{userReceives.toLocaleString()}</span>
                  <span className="token vs-token">vS</span>
                </div>
              </div>

              <div className="nft-details-modern">
                <div className="detail-item">
                  <span className="label">Vesting End</span>
                  <span className="value">{nft.vestingEndDate}</span>
                </div>
                <div className="detail-item fee-detail">
                  <span className="label">Protocol Fee</span>
                  <span className="value fee">-{mintFee.toLocaleString()} S (1%)</span>
                </div>
              </div>

              <motion.button 
                className="deposit-button-modern"
                onClick={() => handleDepositClick(nft)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Deposit & Mint vS</span>
                <span className="button-arrow">→</span>
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

      {selectedNft && <DepositModal nft={selectedNft} onClose={() => setSelectedNft(null)} />}
    </div>
  );
};
