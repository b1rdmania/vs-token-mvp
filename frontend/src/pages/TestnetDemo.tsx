import React, { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import DecayfNFTArtifact from '../abis/DecayfNFT.json';
import MockTokenArtifact from '../abis/MockToken.json';
import ImmutableVaultArtifact from '../abis/ImmutableVault.json';
import ImmutableVSTokenArtifact from '../abis/ImmutableVSToken.json';
import ShadowDEXPoolInfo from '../components/ShadowDEXIntegration';
import '../styles/common.css';
import { ethers } from 'ethers';

// Correct Contract Addresses (Sonic Mainnet)
const DECAYFNFT_ADDRESS = '0xdf34078C9C8E5891320B780F6C8b8a54B784108C';
const MOCKTOKEN_ADDRESS = '0x4a201419ED3e4d6D58A434F1D077AD7B2ED71f49';
const VSTOKEN_ADDRESS = '0x4dE74524A2cE5e2A310615a6aDe7eC35B0f81031';
const VAULT_ADDRESS = '0x37BD20868FB91eB37813648F4D05F59e07A1bcfb';

const explorerBase = 'https://sonicscan.org/address/';

function AddressRow({ label, address }: { label: string; address: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <span style={{ minWidth: 90, fontWeight: 500 }}>{label}:</span>
      <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{address}</span>
      <button
        style={{ marginLeft: 8, fontSize: 12, padding: '2px 8px', borderRadius: 4, border: '1px solid #eaecef', background: copied ? '#d1fae5' : '#f8f9fa', cursor: 'pointer' }}
        onClick={() => {
          navigator.clipboard.writeText(address);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        title="Copy address"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <a
        href={`${explorerBase}${address}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginLeft: 8, fontSize: 12, color: '#1F6BFF', textDecoration: 'underline' }}
        title="View on Sonic Explorer"
      >
        Explorer
      </a>
    </div>
  );
}

const TestnetDemo: React.FC = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { openConnectModal } = useConnectModal();

  const [fNFTBalance, setFNFTBalance] = useState<string>('0');
  const [underlyingBalance, setUnderlyingBalance] = useState<string>('0');
  const [vsBalance, setVsBalance] = useState<string>('0');
  const [vaultBalance, setVaultBalance] = useState<string>('0');
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'mint' | 'trade' | 'redeem'>('mint');
  const [status, setStatus] = useState<string>('');
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [tradeExecuted, setTradeExecuted] = useState<boolean>(false);

  const loadOwnedNFTs = async () => {
    if (!address || !publicClient) return;
    
    try {
      const provider = new ethers.JsonRpcProvider(publicClient?.transport.url);
      const decayfNFT = new ethers.Contract(DECAYFNFT_ADDRESS, DecayfNFTArtifact.abi, provider);
      
      const userNFTs: any[] = [];
      const maxTokenId = 100; // Check first 100 token IDs
      
      for (let tokenId = 0; tokenId < maxTokenId; tokenId++) {
        try {
          const owner = await decayfNFT.ownerOf(tokenId);
          const isUserOwned = owner.toLowerCase() === address.toLowerCase();
          const isVaultOwned = owner.toLowerCase() === VAULT_ADDRESS.toLowerCase();
          
          // Check if this NFT was originally minted by the user (even if now owned by vault)
          let isUserNFT = isUserOwned;
          if (isVaultOwned) {
            // Check if user has any deposit records for this NFT (simplified check)
            // In a real app, you'd check vault events or have a mapping
            // For demo, we'll assume any vault-owned NFT in this range belongs to connected user
            isUserNFT = true;
          }
          
          if (isUserNFT) {
            const totalAmount = await decayfNFT.getTotalAmount(tokenId);
            const vestingInfo = await decayfNFT.vestingSchedules(tokenId);
            const claimedAmount = vestingInfo.claimedAmount;
            const availableAmount = await decayfNFT.claimable(tokenId);
            const vestedAmount = await decayfNFT.getVestedAmount(tokenId);
            
            const totalAmountFormatted = ethers.formatEther(totalAmount.toString());
            const claimedAmountFormatted = ethers.formatEther(claimedAmount.toString());
            const availableAmountFormatted = ethers.formatEther(availableAmount.toString());
            const progress = totalAmount > 0 ? Math.floor((Number(vestedAmount) / Number(totalAmount)) * 100) : 0;
            
            userNFTs.push({
              tokenId,
              totalAmount: totalAmountFormatted,
              claimedAmount: claimedAmountFormatted,
              availableAmount: availableAmountFormatted,
              progress,
              isDepositedInVault: isVaultOwned,
              canClaimDirectly: isUserOwned && parseFloat(availableAmountFormatted) > 0,
              canDepositToVault: isUserOwned
            });
          }
        } catch (error) {
          // Token doesn't exist or not owned by user, continue
        }
      }
      
      setOwnedNFTs(userNFTs);
    } catch (error) {
      console.error('Error loading owned NFTs:', error);
    }
  };

  const loadBalances = async () => {
    if (!address || !publicClient) return;

    try {
      // Get fNFT balance
      const nftBalance = await publicClient.readContract({
        address: DECAYFNFT_ADDRESS as `0x${string}`,
        abi: DecayfNFTArtifact.abi,
        functionName: 'balanceOf',
        args: [address],
      });
      setFNFTBalance(nftBalance.toString());

      // Get underlying token balance  
      const tokenBalance = await publicClient.readContract({
        address: MOCKTOKEN_ADDRESS as `0x${string}`,
        abi: MockTokenArtifact.abi,
        functionName: 'balanceOf',
        args: [address],
      });
      setUnderlyingBalance(ethers.formatEther(tokenBalance.toString()));

      // Get vS token balance
      try {
        const vsTokenBalance = await publicClient.readContract({
          address: VSTOKEN_ADDRESS as `0x${string}`,
          abi: ImmutableVSTokenArtifact.abi,
          functionName: 'balanceOf',
          args: [address],
        });
        setVsBalance(ethers.formatEther(vsTokenBalance.toString()));
      } catch (error) {
        console.log('vS token not deployed yet or error reading balance');
        setVsBalance('0');
      }

      // Get vault total assets
      try {
        const vaultAssets = await publicClient.readContract({
          address: VAULT_ADDRESS as `0x${string}`,
          abi: ImmutableVaultArtifact.abi,
          functionName: 'totalAssets',
          args: [],
        });
        setVaultBalance(ethers.formatEther(vaultAssets.toString()));
      } catch (error) {
        console.log('Vault not deployed yet or error reading balance');
        setVaultBalance('0');
      }

      // Get owned NFTs
      await loadOwnedNFTs();
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      loadBalances();
    }
  }, [isConnected, address, publicClient]);

  const mintTokens = async () => {
    if (!walletClient || !address) return;

    setIsLoading(true);
    setStatus('Requesting tS from faucet...');
    try {
      const hash = await walletClient.writeContract({
        address: MOCKTOKEN_ADDRESS as `0x${string}`,
        abi: MockTokenArtifact.abi,
        functionName: 'faucet',
        args: [],
      });

      setTxHash(hash);
      console.log('Faucet transaction sent:', hash);

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log('Faucet confirmed:', receipt);

      setStatus('Faucet success! You received 1000 tS.');
      // Reload balances
      await loadBalances();
    } catch (error) {
      console.error('Error minting tokens:', error);
      setStatus('Faucet failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const executeTradeDemo = async () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) return;
    
    setIsLoading(true);
    setStatus('Executing trade on Shadow DEX...');
    
    // Simulate trade execution
    setTimeout(() => {
      setTradeExecuted(true);
      setStatus(`Demo trade executed! In reality, you'd receive market rate from the Shadow DEX pool.`);
      setIsLoading(false);
    }, 2000);
  };

  const mintfNFT = async () => {
    if (!walletClient || !address) return;

    setIsLoading(true);
    setStatus('Minting realistic demo fNFT...');
    try {
      const provider = new ethers.JsonRpcProvider(publicClient?.transport.url);
      const tsToken = new ethers.Contract(MOCKTOKEN_ADDRESS, MockTokenArtifact.abi, provider);
      
      // Mint realistic demo fNFT - 500 tS (similar to typical Sonic airdrop)
      const demoAmount = ethers.parseEther('500'); // Much smaller, realistic amount
      
      // First approve the spending
      const approveHash = await walletClient.writeContract({
        address: MOCKTOKEN_ADDRESS as `0x${string}`,
        abi: MockTokenArtifact.abi,
        functionName: 'approve',
        args: [DECAYFNFT_ADDRESS, demoAmount],
      });

      console.log('Approval transaction sent:', approveHash);
      await publicClient?.waitForTransactionReceipt({ hash: approveHash });

      // Then mint the NFT with realistic Sonic airdrop timeframe
      const mintHash = await walletClient.writeContract({
        address: DECAYFNFT_ADDRESS as `0x${string}`,
        abi: DecayfNFTArtifact.abi,
        functionName: 'safeMint',
        args: [address, demoAmount, 23328000], // 270 days like real Sonic airdrop
      });

      setTxHash(mintHash);
      console.log('Mint transaction sent:', mintHash);

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: mintHash });
      console.log('Mint confirmed:', receipt);

      setStatus('✅ Realistic demo fNFT minted! (500 tS - low gas to deposit)');
      // Reload balances and NFT data
      await loadBalances();
    } catch (error) {
      console.error('Error minting fNFT:', error);
      setStatus('Mint failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const claimVested = async (tokenId: number) => {
    if (!walletClient || !address) return;

    setIsLoading(true);
    setStatus('Claiming vested tS...');
    try {
      const hash = await walletClient.writeContract({
        address: DECAYFNFT_ADDRESS as `0x${string}`,
        abi: DecayfNFTArtifact.abi,
        functionName: 'claimVestedTokens',
        args: [tokenId],
      });

      setTxHash(hash);
      console.log('Claim transaction sent:', hash);

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log('Claim confirmed:', receipt);

      setStatus('Claimed!');
      // Reload balances and NFT data
      await loadBalances();
    } catch (error) {
      console.error('Error claiming vested tokens:', error);
      setStatus('Claim failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const depositToVault = async (tokenId: number) => {
    if (!walletClient || !address) return;

    setIsLoading(true);
    setStatus('Step 1/3: Delegating claim rights...');
    try {
      // First delegate claiming rights to the vault
      const delegateHash = await walletClient.writeContract({
        address: DECAYFNFT_ADDRESS as `0x${string}`,
        abi: DecayfNFTArtifact.abi,
        functionName: 'delegateClaimRights',
        args: [tokenId, VAULT_ADDRESS],
      });

      console.log('Delegation transaction sent:', delegateHash);
      await publicClient?.waitForTransactionReceipt({ hash: delegateHash });

      setStatus('Step 2/3: Approving NFT transfer...');
      
      // Then approve the vault to transfer the NFT
      const approveHash = await walletClient.writeContract({
        address: DECAYFNFT_ADDRESS as `0x${string}`,
        abi: DecayfNFTArtifact.abi,
        functionName: 'approve',
        args: [VAULT_ADDRESS, tokenId],
      });

      console.log('Approval transaction sent:', approveHash);
      await publicClient?.waitForTransactionReceipt({ hash: approveHash });

      setStatus('Step 3/3: Depositing to vault...');

      // Get NFT value for status message
      const nftDetails = ownedNFTs.find(nft => nft.tokenId === tokenId);
      const nftValue = nftDetails ? parseFloat(nftDetails.totalAmount) : 0;
      
      setStatus(`Step 3/3: Depositing ${nftValue} TEST_S fNFT to vault...`);

      // Finally deposit to vault
      const depositHash = await walletClient.writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: ImmutableVaultArtifact.abi,
        functionName: 'deposit',
        args: [tokenId],
      });

      setTxHash(depositHash);
      console.log('Deposit transaction sent:', depositHash);

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: depositHash });
      console.log('Deposit confirmed:', receipt);

      setStatus('✅ Deposited! You received full-value vS tokens (tradeable at market discount).');
      // Reload balances and NFT data
      await loadBalances();
    } catch (error) {
      console.error('Error depositing to vault:', error);
      setStatus('❌ Deposit failed. ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const redeemFromVault = async (amount: string) => {
    if (!walletClient || !address || !amount) return;

    setIsLoading(true);
    setStatus('Redeeming from vault (low gas)...');
    try {
      const amountWei = ethers.parseEther(amount);
      
      const hash = await walletClient.writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: ImmutableVaultArtifact.abi,
        functionName: 'redeem',
        args: [amountWei],
      });

      setTxHash(hash);
      console.log('Simple redeem transaction sent:', hash);

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log('Simple redeem confirmed:', receipt);

      setStatus('Redeemed! You received underlying tokens (low gas cost).');
      // Reload balances
      await loadBalances();
    } catch (error) {
      console.error('Error redeeming from vault:', error);
      setStatus('Redeem failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const claimVaultVested = async () => {
    if (!walletClient || !address) return;

    setIsLoading(true);
    setStatus('Claiming vault vested tokens...');
    try {
      const hash = await walletClient.writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: ImmutableVaultArtifact.abi,
        functionName: 'claimBatch',
        args: [10], // Process 10 NFTs
      });

      setTxHash(hash);
      console.log('Vault claim transaction sent:', hash);

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log('Vault claim confirmed:', receipt);

      setStatus('Vault tokens claimed successfully!');
      // Reload balances
      await loadBalances();
    } catch (error) {
      console.error('Error claiming vault vested tokens:', error);
      setStatus('Vault claim failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Value Proposition Header */}
      <div className="content-card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: 32, color: 'white', textAlign: 'center' }}>🚀 vS Vault: Get Full Value Now, Pay Time Discount</h1>
        
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#e8f4ff' }}>💡 The Simple Model</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>1️⃣ <strong>Deposit fNFT</strong></div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Transfer your entire fNFT to the vault permanently</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>2️⃣ <strong>Get Full Value vS</strong></div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Receive vS tokens equal to fNFT's TOTAL value (1000 vS for 1000 S fNFT)</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>3️⃣ <strong>Market Prices Time</strong></div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>vS trades at discount (0.25 S) reflecting time to maturity</div>
            </div>
                          <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>4️⃣ <strong>Prices Should Converge</strong></div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>As months pass, vS price should converge toward full S value</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>5️⃣ <strong>Exit Anytime</strong></div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>Sell vS on DEX at current market rate for immediate liquidity</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>6️⃣ <strong>Month 9: Redeem</strong></div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>Redeem vS to S at 1:1 price on our site when fNFTs mature</div>
              </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#ffcccb' }}>😵 Without vS Vault</h3>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              • fNFT locked for 9 months<br/>
              • Can only claim 25% now<br/>
              • Must wait for full value<br/>
              • No immediate liquidity
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#90ee90' }}>🚀 With vS Vault</h3>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              • Get full value vS tokens now<br/>
              • Trade at market discount (0.25x)<br/>
              • Prices should converge over time<br/>
              • Immediate DeFi liquidity
            </div>
          </div>
        </div>
      </div>

      {/* Status Dashboard */}
      <div className="content-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>📊 Your Assets</h3>
          {!isConnected && (
            <button onClick={openConnectModal} className="button-primary" style={{ padding: '8px 16px', fontSize: 14 }}>
              Connect Wallet to Interact
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div style={{ background: '#fff3e0', padding: 16, borderRadius: 8, border: '1px solid #ffcc02', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>fNFTs Owned</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f57c00' }}>{isConnected ? fNFTBalance : '--'}</div>
          </div>
          <div style={{ background: '#e3f2fd', padding: 16, borderRadius: 8, border: '1px solid #2196f3', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>TEST_S Balance</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1976d2' }}>{isConnected ? Number(underlyingBalance).toFixed(0) : '--'}</div>
          </div>
          <div style={{ background: '#e8f5e8', padding: 16, borderRadius: 8, border: '1px solid #4caf50', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>TEST_vS Balance</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#2e7d32' }}>{isConnected ? Number(vsBalance).toFixed(0) : '--'}</div>
          </div>
          <div style={{ background: '#f3e5f5', padding: 16, borderRadius: 8, border: '1px solid #9c27b0', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Vault Assets</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#7b1fa2' }}>{isConnected ? Number(vaultBalance).toFixed(0) : '--'}</div>
          </div>
        </div>
        {!isConnected && (
          <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: 14, color: '#1e40af' }}>
              💡 <strong>Demo Mode:</strong> Connect wallet to interact with live contracts on Sonic Mainnet
            </div>
          </div>
        )}
      </div>

          {/* Main Tabs */}
          <div className="content-card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', marginBottom: 24 }}>
              <div style={{ display: 'flex', background: '#f8f9fa', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
                <button 
                  style={{ 
                    padding: '12px 20px', 
                    border: 'none', 
                    background: activeTab === 'mint' ? '#1F6BFF' : 'transparent',
                    color: activeTab === 'mint' ? 'white' : '#666',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'mint' ? 'bold' : 'normal'
                  }}
                  onClick={() => setActiveTab('mint')}
                >
                  🎯 Step 1: Deposit fNFT → Get vS
                </button>
                <button 
                  style={{ 
                    padding: '12px 20px', 
                    border: 'none', 
                    background: activeTab === 'trade' ? '#1F6BFF' : 'transparent',
                    color: activeTab === 'trade' ? 'white' : '#666',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'trade' ? 'bold' : 'normal'
                  }}
                  onClick={() => setActiveTab('trade')}
                >
                  💰 Step 2: Trade vS for Immediate Liquidity
                </button>
                <button 
                  style={{ 
                    padding: '12px 20px', 
                    border: 'none', 
                    background: activeTab === 'redeem' ? '#1F6BFF' : 'transparent',
                    color: activeTab === 'redeem' ? 'white' : '#666',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'redeem' ? 'bold' : 'normal'
                  }}
                  onClick={() => setActiveTab('redeem')}
                >
                  🎯 Step 3: 1:1 Redemption (Day 270+)
                </button>
              </div>
            </div>

            {activeTab === 'mint' && (
              <>
                <div style={{ background: '#e8f5e8', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #4caf50' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>🎯 Step 1: Get Full-Value vS Tokens</h3>
                  <div style={{ fontSize: 15, marginBottom: 12 }}>
                    Mint test assets → Create demo fNFT → Deposit to vault → Receive full-value vS tokens immediately
                  </div>
                  <div style={{ background: '#d1f2eb', padding: 12, borderRadius: 6, border: '1px solid #7dcea0' }}>
                    <strong>💡 Simple:</strong> Deposit 10,000 TEST_S fNFT → Get 10,000 TEST_vS tokens. Full value immediately, trade for instant liquidity.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
                  <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8, border: '1px solid #eaecef' }}>
                    <h3 style={{ margin: '0 0 12px 0' }}>🔥 Get Test Tokens</h3>
                    <p style={{ margin: '0 0 16px 0' }}>Mint yourself TEST_S tokens for testing</p>
                    <button
                      onClick={mintTokens}
                      disabled={isLoading || !isConnected}
                      className="button-primary"
                      style={{ width: '100%' }}
                    >
                      {!isConnected ? 'Connect Wallet' : isLoading ? 'Minting...' : 'Get 15,000 TEST_S'}
                    </button>
                  </div>

                  <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8, border: '1px solid #eaecef' }}>
                    <h3 style={{ margin: '0 0 12px 0' }}>🎟️ Mint Demo fNFT</h3>
                    <p style={{ margin: '0 0 16px 0' }}>Create demo fNFT (10,000 TEST_S, 270 days vesting)</p>
                    <button
                      onClick={mintfNFT}
                      disabled={isLoading || !isConnected}
                      className="button-primary"
                      style={{ width: '100%' }}
                    >
                      {!isConnected ? 'Connect Wallet' : isLoading ? 'Minting...' : 'Mint Demo fNFT (10,000 TEST_S)'}
                    </button>
                  </div>
                </div>

                {ownedNFTs.length > 0 && (
                  <div>
                    <h3>🎫 Your fNFTs</h3>
                    <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
                      {ownedNFTs.map((nft) => (
                        <div key={nft.tokenId} style={{ 
                          background: nft.isDepositedInVault ? '#f0f8f0' : '#fff', 
                          padding: 16, 
                          borderRadius: 8, 
                          border: nft.isDepositedInVault ? '2px solid #28a745' : '1px solid #eaecef' 
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                              <h4 style={{ margin: 0 }}>fNFT #{nft.tokenId}</h4>
                              {nft.isDepositedInVault && (
                                <div style={{ background: '#28a745', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 11, marginTop: 4, display: 'inline-block' }}>
                                  ✅ DEPOSITED IN VAULT
                                </div>
                              )}
                            </div>
                            <div style={{ background: '#e6f7ff', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                              {nft.progress}% unlocked
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginBottom: 16, fontSize: 14 }}>
                            <div><strong>Total Value:</strong> {Number(nft.totalAmount).toFixed(0)} TEST_S</div>
                            <div><strong>Vesting:</strong> 270 days</div>
                            <div><strong>Status:</strong> {nft.progress}% unlocked</div>
                          </div>
                          
                          {nft.isDepositedInVault ? (
                            // NFT is deposited in vault - show vault status
                            <div style={{ background: '#e8f5e8', padding: 12, borderRadius: 6, border: '1px solid #28a745' }}>
                              <div style={{ fontSize: 14, marginBottom: 8 }}>
                                <strong>🏦 In Vault:</strong> This fNFT is deposited and you received full-value vS tokens.
                              </div>
                              <div style={{ fontSize: 13, color: '#666' }}>
                                • Check "Step 2" tab to trade your vS tokens<br/>
                                • Use Shadow DEX to get immediate liquidity
                              </div>
                            </div>
                          ) : (
                            // NFT is still owned by user - show simple deposit option
                            <button
                              onClick={() => {
                                const confirmed = window.confirm(
                                  `Deposit fNFT #${nft.tokenId} to Vault?\n\n` +
                                  `• Get ${Number(nft.totalAmount).toFixed(0)} TEST_vS tokens immediately\n` +
                                  `• Trade TEST_vS for instant liquidity\n` +
                                  `• At day 270: Redeem TEST_vS → TEST_S at 1:1\n\n` +
                                  `Continue?`
                                );
                                if (confirmed) {
                                  depositToVault(nft.tokenId);
                                }
                              }}
                              disabled={isLoading || !nft.canDepositToVault || !isConnected}
                              className="button-primary"
                              style={{ width: '100%', background: '#28a745', padding: '12px' }}
                            >
                              {!isConnected ? 'Connect Wallet' : isLoading ? 'Depositing...' : `Deposit → Get ${Number(nft.totalAmount).toFixed(0)} TEST_vS`}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'trade' && (
              <div>
                <div style={{ background: '#e8f5e8', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #4caf50' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>💰 Step 2: Trade for Immediate Liquidity</h3>
                  <div style={{ fontSize: 15, marginBottom: 12 }}>
                    Trade your vS tokens in the Shadow DEX pool for immediate S tokens at current market rates
                  </div>
                  <div style={{ background: '#d1f2eb', padding: 12, borderRadius: 6, border: '1px solid #7dcea0' }}>
                    <strong>Market-Driven:</strong> No fake pricing - the Shadow DEX pool determines real market rates based on supply, demand, and time to maturity
                  </div>
                </div>

                <ShadowDEXPoolInfo
                  vsBalance={vsBalance}
                />
              </div>
            )}
          </div>

          {status && (
            <div className="content-card" style={{ textAlign: 'center', background: '#e6f7ff', border: '1px solid #b3d9ff' }}>
              <strong>Status:</strong> {status}
            </div>
          )}

          {txHash && (
            <div className="content-card" style={{ textAlign: 'center', background: '#f0f8f0', border: '1px solid #d1e7d1' }}>
              <strong>Last Transaction:</strong>{' '}
              <a
                href={`https://sonicscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1F6BFF', textDecoration: 'underline' }}
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            </div>
          )}

      <footer style={{ marginTop: 48, textAlign: 'center', color: '#888', fontSize: 14 }}>
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>Contract Addresses</h4>
          <div style={{ display: 'grid', gap: 4, fontSize: 12, textAlign: 'left', maxWidth: 600, margin: '0 auto' }}>
            <AddressRow label="fNFT" address={DECAYFNFT_ADDRESS} />
            <AddressRow label="tS Token" address={MOCKTOKEN_ADDRESS} />
            <AddressRow label="vS Token" address={VSTOKEN_ADDRESS} />
            <AddressRow label="Vault" address={VAULT_ADDRESS} />
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <a href={`https://sonicscan.io/address/${VAULT_ADDRESS}`} target="_blank" rel="noopener noreferrer">View Vault on Sonic Explorer</a>
          {' | '}
          <a href="https://github.com/b1rdmania/vs-token-mvp" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <div>Sonic Mainnet &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
};

export default TestnetDemo; 