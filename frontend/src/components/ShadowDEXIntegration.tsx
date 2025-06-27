import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Updated contract addresses (Gas-Optimized Deployment)
const CONTRACTS = {
  DVS_TOKEN: '0x2649125B1a683e3448F2BB15425AcD83aa2dfd35',
  TS_TOKEN: '0x16e5294Cc116819BfB79752C238a74c9f83a35f9',
  VAULT: '0x2e17544f3E692a05F9c3C88049bca0eBCF27Bb6B'
};

// Shadow DEX addresses (REAL ADDRESSES ON SONIC MAINNET)
const SHADOW_DEX = {
  ROUTER: '0x1D368773735ee1E678950B7A97bcA2CafB330CDc', // Shadow Router
  FACTORY: '0x2dA25E7446A70D7be65fd4c053948BEcAA6374c8', // Shadow Factory  
  POOL: '0x0516676e5f9f0253228483a5f61313a53b4be07f' // REAL D-vS/tS Pool!
};

const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
];

interface ShadowDEXPoolInfoProps {
  dvsBalance: string;
}

const ShadowDEXPoolInfo: React.FC<ShadowDEXPoolInfoProps> = ({ dvsBalance }) => {
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoolInfo();
  }, []);

  const loadPoolInfo = async () => {
    try {
      const provider = new ethers.JsonRpcProvider('https://sonic.drpc.org');
      const dvsToken = new ethers.Contract(CONTRACTS.DVS_TOKEN, ERC20_ABI, provider);
      const tsToken = new ethers.Contract(CONTRACTS.TS_TOKEN, ERC20_ABI, provider);
      
      const [dvsReserve, tsReserve] = await Promise.all([
        dvsToken.balanceOf(SHADOW_DEX.POOL),
        tsToken.balanceOf(SHADOW_DEX.POOL)
      ]);
      
      const dvsReserveFormatted = ethers.formatEther(dvsReserve);
      const tsReserveFormatted = ethers.formatEther(tsReserve);
      
      setPoolInfo({
        address: SHADOW_DEX.POOL,
        dvsReserve: dvsReserveFormatted,
        tsReserve: tsReserveFormatted,
        ratio: dvsReserve > 0 ? Number(tsReserveFormatted) / Number(dvsReserveFormatted) : 0,
        tvl: (Number(dvsReserveFormatted) + Number(tsReserveFormatted)).toFixed(2)
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
        🌚 Shadow DEX Liquidity Pool
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
          ⚠️ CRITICAL: Read Before Claiming
        </h4>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#dc2626', fontWeight: 500 }}>
          <strong>CLAIMING SONIC TOKENS IS IRREVERSIBLE!</strong>
        </p>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#dc2626' }}>
          • When you claim Sonic tokens, your fNFT is <strong>permanently sold</strong>
        </p>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#dc2626' }}>
          • You <strong>cannot get your fNFT back</strong> after claiming
        </p>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#dc2626' }}>
          • This funds your immediate liquidity at a discount
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#dc2626' }}>
          • Only claim if you need <strong>immediate access</strong> to tokens
        </p>
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
          Loading pool information...
        </div>
      ) : poolInfo ? (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#d1fae5', 
          border: '1px solid #34d399', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#047857' }}>✅ Live Shadow DEX Pool</h4>
          <div style={{ fontSize: '14px', color: '#047857' }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Pool Liquidity:</strong> {poolInfo.dvsReserve} D-vS / {poolInfo.tsReserve} tS
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Current Rate:</strong> 1 D-vS = {poolInfo.ratio.toFixed(4)} tS
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Total Value:</strong> ~{poolInfo.tvl} tokens
            </div>
            <div>
              <strong>Discount:</strong> ~{((1 - poolInfo.ratio) * 100).toFixed(1)}% for immediate liquidity
            </div>
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
          <h4 style={{ margin: '0 0 8px 0', color: '#996f00' }}>⚠️ Pool Loading Failed</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#996f00' }}>
            Unable to load pool information. Please check your connection.
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
        <h4 style={{ margin: '0 0 12px 0', color: '#0369a1' }}>💡 How Liquidity Claims Work</h4>
        <div style={{ fontSize: '13px', color: '#0369a1', lineHeight: '1.5' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>1. You have D-vS tokens</strong> (from depositing your fNFT)
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>2. Shadow DEX pool provides liquidity</strong> for D-vS ↔ tS trades
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>3. Market sets the exchange rate</strong> (currently ~{poolInfo?.ratio.toFixed(2)} tS per D-vS)
          </div>
          <div>
            <strong>4. You get immediate tokens</strong> instead of waiting for vesting
          </div>
        </div>
      </div>

      {/* Pool Links */}
      <div style={{ 
        padding: '12px', 
        backgroundColor: '#f9fafb', 
        border: '1px solid #e5e7eb',
        borderRadius: '6px' 
      }}>
        <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
          External Pool Links:
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
            View on Shadow DEX →
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
            View on Explorer →
          </a>
        </div>
      </div>

      {/* Implementation Status */}
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        backgroundColor: '#ecfdf5', 
        border: '1px solid #22c55e',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#047857'
      }}>
        <strong>🎉 LIVE IMPLEMENTATION:</strong>
        <br />
        • Contracts: ✅ Deployed on Sonic Mainnet
        <br />
        • Shadow DEX Pool: ✅ LIVE and functional
        <br />
        • Liquidity Claims: ✅ Available via vault interface
        <br />
        • Pool Address: {SHADOW_DEX.POOL.slice(0, 20)}...
      </div>
    </div>
  );
};

export default ShadowDEXPoolInfo; 