import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
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
    vestingEndDate: '16 Mar 2026',
  },
  {
    id: 5678,
    lockedAmount: 10000,
    vestingEndDate: '16 Mar 2026',
  },
];

const DepositModal = ({ nft, onClose }: { nft: Nft; onClose: () => void }) => (
  <div className="modal-backdrop">
    <div className="modal-content content-card">
      <h2>Deposit NFT #{nft.id}</h2>
      <p>Deposit your fNFT and receive the full value in vS tokens immediately.</p>
      
      <div className="modal-warning">
        <strong>⚠️ Warning:</strong> This action is irreversible. Your fNFT will be permanently converted to vS tokens.
      </div>
      
      <div className="modal-details">
        <div>
          <span>fNFT Value</span>
          <strong>{nft.lockedAmount.toLocaleString()} S</strong>
        </div>
        <div>
          <span>vS Tokens You Get</span>
          <strong>{nft.lockedAmount.toLocaleString()} vS</strong>
        </div>
        <div>
          <span>Gas Estimate</span>
          <strong>~0.005 S</strong>
        </div>
      </div>
      <div className="modal-actions">
        <button className="button-secondary" onClick={onClose}>Cancel</button>
        <button className="button-primary">Confirm Deposit</button>
      </div>
    </div>
  </div>
);

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

  return (
    <div className="page-container">
      <h1 className="page-title">Your fNFTs</h1>
      <p className="page-description">Select an fNFT to deposit into the vault and receive full-value vS tokens immediately.</p>
      
      <div className="warning-banner">
        <h3>⚠️ Important: This Action is Irreversible</h3>
        <p>
          Your fNFT will be permanently converted to liquid vS tokens, which are:
        </p>
        <ul>
          <li><strong>Redeemable 1:1</strong> for S tokens at full vest maturity</li>
          <li><strong>Fully liquid</strong> and tradeable on Shadow DEX</li>
          <li><strong>DeFi-ready</strong> for use as collateral in flywheels throughout the Sonic ecosystem</li>
        </ul>
      </div>
      
      {!isConnected && (
         <div className="dummy-data-banner">
            <strong>Note:</strong> You are viewing demo data. Please connect your wallet to see your actual fNFTs.
        </div>
      )}

      <div className="nft-grid">
        {mockNfts.map((nft) => (
          <div key={nft.id} className="content-card nft-card">
            <h3>Token ID: {nft.id}</h3>
            <div className="nft-details">
              <div>
                <span>Locked Amount</span>
                <strong>{nft.lockedAmount.toLocaleString()} S</strong>
              </div>
              <div>
                <span>Vesting End Date</span>
                <strong>{nft.vestingEndDate}</strong>
              </div>
              <div>
                <span>vS Tokens You Get</span>
                <strong className="vs-amount">{nft.lockedAmount.toLocaleString()} vS</strong>
              </div>
            </div>
            <button className="button-primary" onClick={() => handleDepositClick(nft)}>Deposit</button>
          </div>
        ))}
      </div>

      {selectedNft && <DepositModal nft={selectedNft} onClose={() => setSelectedNft(null)} />}
    </div>
  );
}; 