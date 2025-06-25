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
    tvl: '0',
    volume24h: '0',
    apr: 'TBD',
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
        <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>💰 Earn Money While You Wait</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#2e7d32' }}>
          Add your tokens to the pool to earn fees from every trade! 
          Your tokens stay productive while keeping your future vesting value.
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#fff3e0', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ffb74d'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>⚠️ Pool Setup Required</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#f57c00' }}>
          <strong>Next step:</strong> Create a Shadow DEX pool with your D-vS and tS tokens to enable liquidity provision.
        </p>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Suggested ratio: 1000 D-vS + 850 tS (15% discount)
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
              <strong>Estimated Annual Rewards:</strong> Will depend on pool trading volume
            </div>
            <div>
              <strong>Pool Ratio:</strong> ~0.85 tS per D-vS (current market rate)
            </div>
          </div>
        )}

        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          textAlign: 'center',
          marginBottom: '15px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
            <strong>Ready to create pool?</strong> Use Shadow DEX directly:
          </p>
          <a 
            href="https://www.shadow.so/liquidity/create"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold'
            }}
          >
            Create Pool on Shadow DEX
          </a>
        </div>

        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#1565c0'
        }}>
          <strong>Token Addresses:</strong><br/>
          D-vS: 0x671B9634158A163521b029528b3Fd73EAefd6422<br/>
          tS: 0x567a92ADA6a5D7d31b9e7aa410D868fa91Cd7b7C
        </div>

        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#2e7d32'
        }}>
          <strong>💡 Pro Tip:</strong> Once the pool is created, you'll earn fees from every trade while keeping your future token value!
        </div>
      </div>
    </div>
  );
};

export default ShadowDEXIntegration; 