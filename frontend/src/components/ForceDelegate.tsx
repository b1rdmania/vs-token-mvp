import React, { useState } from 'react';

interface ForceDelegateProps {
  vaultAddress: string;
}

export const ForceDelegate: React.FC<ForceDelegateProps> = ({ vaultAddress }) => {
  const [nftIds, setNftIds] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForceDelegate = async () => {
    if (!nftIds.trim()) return;
    
    setIsLoading(true);
    try {
      const ids = nftIds.split(',').map(id => id.trim()).filter(id => id);
      
      if (ids.length > 50) {
        alert('Maximum 50 NFT IDs allowed per batch');
        return;
      }

      // This would integrate with your web3 provider
      console.log('Force delegating NFT IDs:', ids, 'to vault:', vaultAddress);
      alert(`Would force delegate ${ids.length} NFTs to vault`);
      
    } catch (error) {
      console.error('Force delegate failed:', error);
      alert('Force delegate failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      margin: '20px 0'
    }}>
      <h3>🔧 Force Delegate (Internal Tool)</h3>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Emergency tool to fix delegation if NFTs lose claim delegation to the vault.
      </p>
      
      <div style={{ marginBottom: '10px' }}>
        <label>
          NFT IDs (comma-separated, max 50):
          <br />
          <textarea
            value={nftIds}
            onChange={(e) => setNftIds(e.target.value)}
            placeholder="1,2,3,4,5..."
            rows={3}
            style={{ 
              width: '100%', 
              padding: '8px',
              marginTop: '5px',
              fontFamily: 'monospace'
            }}
          />
        </label>
      </div>
      
      <button 
        onClick={handleForceDelegate}
        disabled={isLoading || !nftIds.trim()}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#ff6b35',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Processing...' : 'Force Delegate'}
      </button>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
        <strong>Note:</strong> This is a permissionless function. Anyone can call it.
        Only use if delegation is broken after protocol upgrades.
      </div>
    </div>
  );
}; 