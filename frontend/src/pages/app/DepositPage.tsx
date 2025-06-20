import React from 'react';

export const DepositPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Deposit fNFT</h1>
      <div className="content-card">
        <h2>Lock your vesting NFT to mint liquid vS</h2>
        <div className="form-group">
          <label htmlFor="nft-selection">Select your fNFT</label>
          <select id="nft-selection" className="form-input">
            <option>Loading your fNFTs...</option>
            {/* Mock options, replace with actual user NFTs */}
            <option value="1">fNFT #001 (10,000 S)</option>
            <option value="2">fNFT #002 (5,000 S)</option>
            <option value="3">fNFT #003 (7,500 S)</option>
          </select>
        </div>
        <div className="deposit-summary">
          <p>You will receive: <strong>10,000 vS</strong></p>
          <p>This will be a 1:1 liquid representation of your locked S tokens.</p>
        </div>
        <button className="button-primary" style={{ width: '100%', marginTop: '1rem' }}>
          Deposit & Mint vS
        </button>
      </div>
    </div>
  );
}; 