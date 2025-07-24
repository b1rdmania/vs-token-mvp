import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import './DepositPage.css';
import { useSonicNFTContract, type SeasonData } from '../../hooks/useSonicNFTContract';
import { useVaultContract } from '../../hooks/useVaultContract';
import toast from 'react-hot-toast';

interface Nft {
  id: number;
  lockedAmount: bigint;
  vestingEndTime: bigint;
}

const DepositModal = ({ nft, onClose }: { nft: Nft; onClose: () => void }) => {
  const { deposit, isDepositing, isDepositConfirming } = useVaultContract();
  
  // Convert from wei to human readable format (18 decimals)
  const lockedAmount = Number(nft.lockedAmount) / 10**18;
  const mintFee = lockedAmount * 0.01; // 1% mint fee
  const userReceives = lockedAmount - mintFee; // Amount after fee
  
  const handleDeposit = async () => {
    try {
      await toast.promise(
        (async () => {
          await deposit();
        })(),
        {
          loading: 'Processing deposit...',
          success: 'Deposit successful! vS tokens minted.',
          error: (err) => `Deposit failed: ${err?.message || err}`,
        },
        {
          style: { minWidth: '250px' },
        }
      );
      onClose(); // Close modal on success
    } catch (e) {
      // Error is handled by toast
    }
  };
  
  return (
    <motion.div 
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal-content modern-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
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
            <strong className="value-highlight">{lockedAmount.toLocaleString()} S</strong>
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
            <strong>Varies by network</strong>
          </motion.div>
        </div>
        
        <div className="modal-actions">
          <button className="button-secondary-modern" onClick={onClose}>Cancel</button>
          <motion.button 
            className="button-primary-modern"
            onClick={handleDeposit}
            disabled={isDepositing || isDepositConfirming}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isDepositing || isDepositConfirming ? 'Processing...' : 'Confirm Deposit'}
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
  const { userNFTs, isLoadingUserNFTs, isApprovedForVault, approveVault, isApproving, season1Data } = useSonicNFTContract();

  // Map userNFTs (NFTInfo) to Nft type for display
  const mappedNFTs: Nft[] = (userNFTs || []).map((nft) => ({
    id: nft.id,
    lockedAmount: nft.balance, // Use balance as locked amount
    vestingEndTime: (season1Data as SeasonData)?.maturationTime ? BigInt((season1Data as SeasonData).maturationTime) : 0n, // Use actual maturation time
  }));

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
      
      {/* Connection State */}
      {!isConnected && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
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
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: '#222' }}>Please connect your wallet</h2>
              <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>Connect your wallet to deposit your fNFTs.</p>
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

      {/* Loading State */}
      {isConnected && isLoadingUserNFTs && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <motion.div 
            className="loading-card"
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
            <div className="loading-spinner" style={{ fontSize: '2.5rem' }}>⏳</div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: '#222' }}>Loading your fNFTs</h2>
              <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>Checking your wallet for available fNFTs...</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* No NFTs State */}
      {isConnected && !isLoadingUserNFTs && (!mappedNFTs || mappedNFTs.length === 0) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <motion.div 
            className="no-nft-card"
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
            <div className="empty-icon" style={{ fontSize: '2.5rem' }}>📭</div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: '#222' }}>No fNFTs found</h2>
              <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>You have no fNFTs available to deposit.</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Approval Banner */}
      {isConnected && !isApprovedForVault && userNFTs && userNFTs.length > 0 && !isLoadingUserNFTs && (
        <motion.div 
          className="approval-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="approval-content">
            <div className="approval-icon">🔐</div>
            <div>
              <strong>Approve Vault Access</strong>
              <p>Allow the vault to transfer your fNFTs for deposit</p>
            </div>
            <button 
              className="button-primary-modern"
              onClick={approveVault}
              disabled={isApproving}
            >
              {isApproving ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </motion.div>
      )}

      {/* NFT Grid */}
      {isConnected && !isLoadingUserNFTs && mappedNFTs && mappedNFTs.length > 0 && (
        <motion.div 
          className="nft-grid-modern"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
          }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {mappedNFTs.map((nft, index) => {
            // Convert from wei to human readable format (18 decimals)
            const lockedAmount = Number(nft.lockedAmount) / 10**18;
            const mintFee = lockedAmount * 0.01;
            const userReceives = lockedAmount - mintFee;
            
            return (
              <motion.div 
                key={nft.id} 
                className="nft-card-modern"
                style={{ maxWidth: 350, width: '100%' }}
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
                    <span className="amount">{lockedAmount.toLocaleString()}</span>
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
                    <span className="value">{nft.vestingEndTime ? new Date(Number(nft.vestingEndTime) * 1000).toLocaleDateString() : '-'}</span>
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
      )}

      {selectedNft && <DepositModal nft={selectedNft} onClose={() => setSelectedNft(null)} />}
    </div>
  );
};
