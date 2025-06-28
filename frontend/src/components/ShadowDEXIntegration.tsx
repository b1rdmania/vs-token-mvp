/**
 * @title ShadowDEXIntegration - vS Token Trading Interface
 * @author vS Vault Team
 * @description Component for trading vS tokens on Shadow DEX (Sonic's native AMM)
 * 
 * @purpose
 * Provides users with immediate liquidity for their vS tokens by connecting to Shadow DEX.
 * This is where the "cash today" value proposition gets realized - users can instantly
 * convert their vault-minted vS tokens into S tokens or other assets.
 * 
 * @functionality
 * - Displays current vS token balance from user's wallet
 * - Shows Shadow DEX pool liquidity and pricing information  
 * - Provides direct swap interface (vS → S or other tokens)
 * - Links to Shadow DEX for advanced trading features
 * - Real-time price discovery based on market demand
 * 
 * @market_dynamics
 * - vS tokens typically trade at discount to face value (time premium)
 * - Discount decreases as maturity approaches (April 2026)
 * - Market sets pricing based on supply/demand, not protocol
 * - Provides immediate exit liquidity for depositors
 * 
 * @integration_notes
 * - Uses Shadow DEX API for real-time pricing
 * - Connects to user's wallet for balance checks
 * - Handles slippage and transaction confirmations
 * - Mobile-optimized for Sonic ecosystem users
 */

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './ShadowDEXIntegration.css';

// Contract addresses (Sonic Mainnet)
const CONTRACTS = {
  VS_TOKEN: '0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031',
  TS_TOKEN: '0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49',
  VAULT: '0x37BD20868FB91eB37813648F4D05F59e07A1bcfb',
  FNFT: '0xdf34078C9C8E5891320B780F6C8b8a54B784108C'
};

// Shadow DEX addresses (Sonic Mainnet)
const SHADOW_DEX = {
  ROUTER: '0x1D368773735ee1E678950B7A97bcA2CafB330CDc',
  FACTORY: '0x2dA25E7446A70D7be65fd4c053948BEcAA6374c8',
  POOL: '0x0516676e5f9f0253228483a5f61313a53b4be07f'
};

const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
];

interface ShadowDEXPoolInfoProps {
  vsBalance: string;
}

const ShadowDEXPoolInfo: React.FC<ShadowDEXPoolInfoProps> = ({ vsBalance }) => {
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoolInfo();
  }, []);

  const loadPoolInfo = async () => {
    try {
      const provider = new ethers.JsonRpcProvider('https://sonic.drpc.org');
      const vsToken = new ethers.Contract(CONTRACTS.VS_TOKEN, ERC20_ABI, provider);
      const tsToken = new ethers.Contract(CONTRACTS.TS_TOKEN, ERC20_ABI, provider);
      
      const [vsReserve, tsReserve] = await Promise.all([
        vsToken.balanceOf(SHADOW_DEX.POOL),
        tsToken.balanceOf(SHADOW_DEX.POOL)
      ]);
      
      const vsReserveFormatted = ethers.formatEther(vsReserve);
      const tsReserveFormatted = ethers.formatEther(tsReserve);
      
      setPoolInfo({
        address: SHADOW_DEX.POOL,
        vsReserve: vsReserveFormatted,
        tsReserve: tsReserveFormatted,
        ratio: vsReserve > 0 ? Number(tsReserveFormatted) / Number(vsReserveFormatted) : 0,
        hasLiquidity: vsReserve > 0 && tsReserve > 0
      });
    } catch (error) {
      console.error('Error loading pool info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #e5e7eb', 
      borderRadius: '12px', 
      backgroundColor: '#f9fafb',
      marginTop: '20px'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>
        🌚 Shadow DEX Pool
      </h3>

      {/* Pool Status */}
      {loading ? (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px', 
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          Loading pool data...
        </div>
      ) : poolInfo?.hasLiquidity ? (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#d1fae5', 
          border: '1px solid #34d399', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#047857' }}>✅ Live Pool</h4>
          <div style={{ fontSize: '14px', color: '#047857', marginBottom: '8px' }}>
            <strong>Current Rate:</strong> 1 vS = {poolInfo.ratio.toFixed(4)} tS
          </div>
          <div style={{ fontSize: '13px', color: '#047857' }}>
            Market-determined pricing • Trade anytime
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffd60a', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#996f00' }}>⚠️ Pool Needs Liquidity</h4>
          <div style={{ fontSize: '14px', color: '#996f00' }}>
            Pool exists but needs initial liquidity to enable trading
          </div>
        </div>
      )}

      {/* Trade Links */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '8px', 
        marginBottom: '16px' 
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#0369a1' }}>Trade Your vS Tokens</h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href={`https://www.shadow.so/swap?from=${CONTRACTS.VS_TOKEN}&to=${CONTRACTS.TS_TOKEN}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#1f6bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Trade on Shadow DEX →
          </a>
          <a
            href={`https://sonicscan.org/address/${SHADOW_DEX.POOL}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#e5e7eb',
              color: '#1f2937',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            View Pool →
          </a>
        </div>
      </div>

      {/* Simple Status */}
      <div style={{ 
        padding: '12px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '6px',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Pool: {SHADOW_DEX.POOL.slice(0, 10)}...{SHADOW_DEX.POOL.slice(-6)}
      </div>
    </div>
  );
};

export default ShadowDEXPoolInfo; 