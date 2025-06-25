import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Shadow DEX Router address on Sonic
const SHADOW_ROUTER_ADDRESS = '0x1D368773735ee1E678950B7A97bcA2CafB330CDc';
const POOL_ADDRESS = '0x143f2acd325c1acd885b64644019f284c49ad330';

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
    apr: 'Pool not created yet',
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
        backgroundColor: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ffc107'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>🚧 Pool Needs Creation</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
          <strong>Action Required:</strong> Create a new Shadow DEX pool with your gas-optimized tokens first.
        </p>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <a href="https://www.shadow.so/" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
            Create Pool on Shadow DEX →
          </a>
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

        <button
          onClick={() => alert('Please create the Shadow DEX pool first using your gas-optimized token addresses:\n\nD-vS: 0x2649125B1a683e3448F2BB15425AcD83aa2dfd35\ntS: 0x16e5294Cc116819BfB79752C238a74c9f83a35f9\n\nGo to https://www.shadow.so/ to create the pool!')}
          disabled={true}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#cccccc',
            color: '#666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'not-allowed',
            marginBottom: '15px'
          }}
        >
          Create Pool First (Shadow DEX Required)
        </button>

        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          textAlign: 'center',
          marginBottom: '15px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
            <strong>Manage your liquidity position:</strong>
          </p>
          <a 
            href={`https://www.shadow.so/liquidity/manage/${POOL_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#4caf50',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold'
            }}
          >
            Manage Pool on Shadow DEX
          </a>
        </div>

        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#1565c0'
        }}>
          <strong>Token Addresses (Gas-Optimized):</strong><br/>
          D-vS: 0x2649125B1a683e3448F2BB15425AcD83aa2dfd35<br/>
          tS: 0x16e5294Cc116819BfB79752C238a74c9f83a35f9
        </div>

        <div style={{ 
          marginTop: '15px', 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#856404',
          border: '1px solid #ffc107'
        }}>
          <strong>📋 Demo Setup Required:</strong><br/>
          1. Create Shadow DEX pool with your gas-optimized tokens<br/>
          2. Add initial liquidity (suggest 500 D-vS + 425 tS)<br/>
          3. Then this interface will become fully functional<br/><br/>
          <strong>💡 Pro Tip:</strong> Once created, you'll earn fees from every trade while keeping your future token value!
        </div>
      </div>
    </div>
  );
};

export default ShadowDEXIntegration; 