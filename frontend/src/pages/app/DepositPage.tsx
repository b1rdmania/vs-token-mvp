import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import './DepositPage.css';

interface Nft {
  id: number;
  lockedAmount: number;
  vestingEndDate: string;
  currentPenalty: number;
}

// Mock data based on the brief
const mockNfts: Nft[] = [
  {
    id: 1234,
    lockedAmount: 4800,
    vestingEndDate: '16 Mar 2026',
    currentPenalty: 95.5,
  },
  {
    id: 5678,
    lockedAmount: 10000,
    vestingEndDate: '16 Mar 2026',
    currentPenalty: 95.5,
  },
];

const DepositModal = ({ nft, onClose }: { nft: Nft; onClose: () => void }) => (
  <div className="modal-backdrop">
    <div className="modal-content">
      <h2>Deposit NFT #{nft.id}</h2>
      <p>This will mint vS tokens against your vesting fNFT.</p>
      <div className="modal-details">
        <div>
          <span>vS to Mint (estimate)</span>
          <strong>{(nft.lockedAmount * (1 - nft.currentPenalty / 100)).toFixed(2)} vS</strong>
        </div>
        <div>
          <span>Current Burn Penalty</span>
          <strong>{nft.currentPenalty}%</strong>
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
    <div className="deposit-page">
      {isConnected ? (
        <>
          <h1>Your fNFTs</h1>
          <p>Select an fNFT to deposit into the vault and mint liquid vS tokens.</p>
        </>
      ) : (
        <>
          <h1>Example fNFTs</h1>
          <p>This is a demonstration of how fNFTs will appear in your wallet. Connect your wallet to see your actual fNFTs and interact with the protocol.</p>
          <div className="dummy-data-banner">
            <strong>Note:</strong> The data below is for demonstration purposes only.
          </div>
        </>
      )}

      <div className="nft-grid">
        {mockNfts.map((nft) => (
          <div key={nft.id} className="nft-card">
            <h2>Token ID: {nft.id}</h2>
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
                <span>Current Penalty</span>
                <strong className="penalty">{nft.currentPenalty}%</strong>
              </div>
            </div>
            <button className="button-primary" onClick={() => handleDepositClick(nft)}>Deposit</button>
          </div>
        ))}
      </div>

      {isConnected && selectedNft && <DepositModal nft={selectedNft} onClose={() => setSelectedNft(null)} />}
    </div>
  );
}; 