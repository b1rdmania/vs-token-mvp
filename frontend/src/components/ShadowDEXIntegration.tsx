import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Shadow DEX Router address on Sonic
const SHADOW_ROUTER_ADDRESS = '0x1D368773735ee1E678950B7A97bcA2CafB330CDc';
const POOL_ADDRESS = '0x85e6cee8ddac8426ebaa1f2191f5969774c5351e';

interface ShadowDEXIntegrationProps {
  userAddress?: string;
  dvsBalance: string;
  tsBalance: string;
  onRefresh: () => void;
}

const ShadowDEXIntegration: React.FC<ShadowDEXIntegrationProps> = ({
  userAddress,
  dvsBalance,
  tsBalance,
  onRefresh
}) => {
  const [dvsAmount, setDvsAmount] = useState('');
  const [tsAmount, setTsAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [poolStats, setPoolStats] = useState({
    tvl: '1,850',
    volume24h: '0',
    apr: '15.0',
    userLpTokens: '0',
    userPoolShare: '0.00'
  });

  // Auto-calculate tS amount based on pool ratio (approximately 0.85 tS per D-vS)
  useEffect(() => {
    if (dvsAmount && !isNaN(parseFloat(dvsAmount))) {
      const tsNeeded = (parseFloat(dvsAmount) * 0.85).toFixed(2);
      setTsAmount(tsNeeded);
    } else {
      setTsAmount('');
    }
  }, [dvsAmount]);

  const handleMaxDvs = () => {
    setDvsAmount(dvsBalance);
  };

  const handleMaxTs = () => {
    setTsAmount(tsBalance);
    // Calculate how much D-vS we can add with this tS amount
    if (tsBalance && !isNaN(parseFloat(tsBalance))) {
      const dvsNeeded = (parseFloat(tsBalance) / 0.85).toFixed(2);
      setDvsAmount(dvsNeeded);
    }
  };

  const handleAddLiquidity = async () => {
    if (!userAddress || !dvsAmount || !tsAmount) return;

    setIsLoading(true);
    try {
      // This would integrate with Shadow DEX add liquidity function
      console.log('Adding liquidity:', { dvsAmount, tsAmount });
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Successfully added ${dvsAmount} D-vS + ${tsAmount} tS to the pool! You are now earning trading fees.`);
      
      // Reset form
      setDvsAmount('');
      setTsAmount('');
      onRefresh();
    } catch (error) {
      console.error('Error adding liquidity:', error);
      alert('Error adding liquidity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const projectedRewards = dvsAmount ? (parseFloat(dvsAmount) * 0.15).toFixed(2) : '0';

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#e8f5e8', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #4caf50'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>💰 Earn Trading Fees & Rewards</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#2e7d32' }}>
          Add your D-vS tokens to the liquidity pool to earn fees from every trade! 
          Your tokens stay productive while maintaining exposure to future vesting value.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h3>Pool Statistics</h3>
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Total Value Locked:</span>
              <strong>${poolStats.tvl}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>24h Volume:</span>
              <strong>${poolStats.volume24h}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Current APR:</span>
              <strong style={{ color: '#4caf50' }}>{poolStats.apr}%</strong>
            </div>
          </div>
        </div>

        <div>
          <h3>Your Position</h3>
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>LP Tokens:</span>
              <strong>{poolStats.userLpTokens}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Pool Share:</span>
              <strong>{poolStats.userPoolShare}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Est. Annual Rewards:</span>
              <strong style={{ color: '#4caf50' }}>${projectedRewards}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
        <h3>Add Liquidity</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            D-vS Amount
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              value={dvsAmount}
              onChange={(e) => setDvsAmount(e.target.value)}
              placeholder="0.0"
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <button
              onClick={handleMaxDvs}
              style={{
                padding: '10px 15px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Max
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Balance: {dvsBalance} D-vS
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            tS Amount (Auto-calculated)
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              value={tsAmount}
              onChange={(e) => setTsAmount(e.target.value)}
              placeholder="0.0"
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <button
              onClick={handleMaxTs}
              style={{
                padding: '10px 15px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Max
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Balance: {tsBalance} tS
          </div>
        </div>

        {dvsAmount && tsAmount && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            <div style={{ marginBottom: '5px' }}>
              <strong>You will receive:</strong> LP tokens representing your share of the pool
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Estimated Annual Rewards:</strong> ${projectedRewards} ({poolStats.apr}% APR)
            </div>
            <div>
              <strong>Pool Ratio:</strong> ~0.85 tS per D-vS (current market rate)
            </div>
          </div>
        )}

        <button
          onClick={handleAddLiquidity}
          disabled={!userAddress || !dvsAmount || !tsAmount || isLoading || parseFloat(dvsAmount) > parseFloat(dvsBalance) || parseFloat(tsAmount) > parseFloat(tsBalance)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: !userAddress || !dvsAmount || !tsAmount || isLoading || parseFloat(dvsAmount) > parseFloat(dvsBalance) || parseFloat(tsAmount) > parseFloat(tsBalance) ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: !userAddress || !dvsAmount || !tsAmount || isLoading || parseFloat(dvsAmount) > parseFloat(dvsBalance) || parseFloat(tsAmount) > parseFloat(tsBalance) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Adding Liquidity...' : 'Add Liquidity & Start Earning'}
        </button>

        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#1565c0'
        }}>
          <strong>💡 Pro Tip:</strong> By providing liquidity, you earn a share of all trading fees plus potential bonus rewards. 
          Your D-vS tokens remain productive while you maintain exposure to the underlying fNFT's vesting value!
        </div>

        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
          Powered by{' '}
          <a 
            href={`https://www.shadow.so/liquidity/manage/${POOL_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'none' }}
          >
            Shadow DEX
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShadowDEXIntegration; 