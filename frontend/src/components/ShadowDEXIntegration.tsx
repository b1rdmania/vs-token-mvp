import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Updated contract addresses (Gas-Optimized Deployment)
const CONTRACTS = {
  DVS_TOKEN: '0x2649125B1a683e3448F2BB15425AcD83aa2dfd35',
  TS_TOKEN: '0x16e5294Cc116819BfB79752C238a74c9f83a35f9',
  VAULT: '0x2e17544f3E692a05F9c3C88049bca0eBCF27Bb6B'
};

// Contract addresses (Sonic Mainnet)
const CONTRACTS = {
  VS_TOKEN: '0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031',
  TS_TOKEN: '0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49',
  VAULT: '0x37BD20868FB91eB37813648F4D05F59e07A1bcfb',
  FNFT: '0xdf34078C9C8E5891320B780F6C8b8a54B784108C'
};

// Shadow DEX addresses (REAL ADDRESSES ON SONIC MAINNET)
const SHADOW_DEX = {
  ROUTER: '0x1D368773735ee1E678950B7A97bcA2CafB330CDc', // Shadow Router
  FACTORY: '0x2dA25E7446A70D7be65fd4c053948BEcAA6374c8', // Shadow Factory  
  POOL: '0x0516676e5f9f0253228483a5f61313a53b4be07f' // REAL vS/tS Pool!
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
        tvl: (Number(vsReserveFormatted) + Number(tsReserveFormatted)).toFixed(2)
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

      {/* CRITICAL WARNING */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#fef2f2', 
        border: '2px solid #dc2626', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#dc2626', fontWeight: 'bold' }}>
          ⚠️ CRITICAL WARNING
        </h4>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#dc2626', fontWeight: 500 }}>
          <strong>Depositing = Permanent fNFT Transfer</strong>
        </p>
        <div style={{ fontSize: '13px', color: '#dc2626' }}>
          • fNFT transferred to vault forever • No recovery possible • Get vS tokens for trading
        </div>
      </div>

      {/* Pool Status */}
      {loading ? (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px', 
          marginBottom: '16px',
          textAlign: 'center' 
        }}>
          Loading pool data...
        </div>
      ) : poolInfo ? (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#d1fae5', 
          border: '1px solid #34d399', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#047857' }}>✅ Live Pool</h4>
          <div style={{ fontSize: '14px', color: '#047857' }}>
            <div><strong>Liquidity:</strong> {poolInfo.vsReserve} vS / {poolInfo.tsReserve} tS</div>
            <div><strong>Current Rate:</strong> 1 vS = {poolInfo.ratio.toFixed(4)} tS</div>
            <div><strong>Real Market:</strong> Price determined by supply/demand, not fake discounts</div>
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffd60a', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#996f00' }}>⚠️ Pool Unavailable</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#996f00' }}>
            Check connection or try again later.
          </p>
        </div>
      )}

      {/* How It Works */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '8px', 
        marginBottom: '16px' 
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#0369a1' }}>How It Works</h4>
        <div style={{ fontSize: '13px', color: '#0369a1' }}>
          vS tokens (from fNFT) → Shadow DEX → Immediate tS tokens at real market rates
          <br />
          No artificial pricing - pure market discovery through trading
        </div>
      </div>

      {/* Links */}
      <div style={{ 
        padding: '12px', 
        backgroundColor: '#f9fafb', 
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        marginBottom: '16px'
      }}>
        <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
          External Links:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href={`https://www.shadow.so/liquidity/manage/${SHADOW_DEX.POOL}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: '#1f2937', 
              fontSize: '12px', 
              textDecoration: 'underline',
              padding: '4px 8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px'
            }}
          >
            Shadow DEX →
          </a>
          <a
            href={`https://sonicscan.org/address/${SHADOW_DEX.POOL}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: '#1f2937', 
              fontSize: '12px', 
              textDecoration: 'underline',
              padding: '4px 8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px'
            }}
          >
            Explorer →
          </a>
        </div>
      </div>

      {/* Status */}
      <div style={{ 
        padding: '12px', 
        backgroundColor: '#ecfdf5', 
        border: '1px solid #22c55e',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#047857'
      }}>
        <strong>Status:</strong> Live on Sonic Mainnet | Pool: {SHADOW_DEX.POOL.slice(0, 10)}...{SHADOW_DEX.POOL.slice(-6)}
      </div>
    </div>
  );
};

export default ShadowDEXPoolInfo; 