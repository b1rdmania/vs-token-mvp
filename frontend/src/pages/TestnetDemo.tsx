import React, { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import DecayfNFTArtifact from '../abis/DecayfNFT.json';
import MockTokenArtifact from '../abis/MockToken.json';
import vSVaultArtifact from '../abis/vSVault.json';
import vSTokenArtifact from '../abis/vSToken.json';
import { ShadowDEXIntegration } from '../components/ShadowDEXIntegration';
import '../styles/common.css';
import { ethers } from 'ethers';

// Sonic Mainnet Demo addresses (NEW - with Emergency Mint & Faucet)
const DECAYFNFT_ADDRESS = '0x755b3C83023eb645596350031F8B7073830F40B8';
const MOCKTOKEN_ADDRESS = '0xdac60C57C6CB5330B1AC068F14ccE1f438a4B7CC';
const VSTOKEN_ADDRESS = '0x2E8D08c00Bc2632fB52aFaAf3DA01e7a5F0a637f';
const VAULT_ADDRESS = '0xa1279bF81E3afE92f9342D97202B72124d740f37';

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
  const [activeTab, setActiveTab] = useState<'mint' | 'vault' | 'trade'>('mint');
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
          if (owner.toLowerCase() === address.toLowerCase()) {
            const totalAmount = await decayfNFT.getTotalAmount(tokenId);
            const claimedAmount = await decayfNFT.getClaimedAmount(tokenId);
            const availableAmount = await decayfNFT.getVestedAmount(tokenId);
            
            const totalAmountFormatted = ethers.formatEther(totalAmount.toString());
            const claimedAmountFormatted = ethers.formatEther(claimedAmount.toString());
            const availableAmountFormatted = ethers.formatEther((availableAmount - claimedAmount).toString());
            const progress = totalAmount > 0 ? Math.floor((Number(claimedAmount) / Number(totalAmount)) * 100) : 0;
            
            userNFTs.push({
              tokenId,
              totalAmount: totalAmountFormatted,
              claimedAmount: claimedAmountFormatted,
              availableAmount: availableAmountFormatted,
              progress
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
          abi: vSTokenArtifact.abi,
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
          abi: vSVaultArtifact.abi,
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
      setStatus(`Successfully traded ${tradeAmount} D-vS for ${(parseFloat(tradeAmount) * 0.85).toFixed(2)} tS on Shadow DEX!`);
      setIsLoading(false);
    }, 2000);
  };

  const mintfNFT = async () => {
    if (!walletClient || !address) return;

    setIsLoading(true);
    setStatus('Minting your fNFT...');
    try {
      const provider = new ethers.JsonRpcProvider(publicClient?.transport.url);
      const tsToken = new ethers.Contract(MOCKTOKEN_ADDRESS, MockTokenArtifact.abi, provider);
      
      // First approve the spending
      const approveHash = await walletClient.writeContract({
        address: MOCKTOKEN_ADDRESS as `0x${string}`,
        abi: MockTokenArtifact.abi,
        functionName: 'approve',
        args: [DECAYFNFT_ADDRESS, ethers.parseEther('10000')],
      });

      console.log('Approval transaction sent:', approveHash);
      await publicClient?.waitForTransactionReceipt({ hash: approveHash });

      // Then mint the NFT
      const mintHash = await walletClient.writeContract({
        address: DECAYFNFT_ADDRESS as `0x${string}`,
        abi: DecayfNFTArtifact.abi,
        functionName: 'safeMint',
        args: [address, ethers.parseEther('10000'), 23328000], // 9 months in seconds
      });

      setTxHash(mintHash);
      console.log('Mint transaction sent:', mintHash);

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: mintHash });
      console.log('Mint confirmed:', receipt);

      setStatus('Minted! You now have a new fNFT.');
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
    setStatus('Depositing to vault...');
    try {
      // First approve the vault to transfer the NFT
      const approveHash = await walletClient.writeContract({
        address: DECAYFNFT_ADDRESS as `0x${string}`,
        abi: DecayfNFTArtifact.abi,
        functionName: 'approve',
        args: [VAULT_ADDRESS, tokenId],
      });

      console.log('Approval transaction sent:', approveHash);
      await publicClient?.waitForTransactionReceipt({ hash: approveHash });

      // Then deposit to vault
      const depositHash = await walletClient.writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vSVaultArtifact.abi,
        functionName: 'deposit',
        args: [tokenId],
      });

      setTxHash(depositHash);
      console.log('Deposit transaction sent:', depositHash);

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: depositHash });
      console.log('Deposit confirmed:', receipt);

      setStatus('Deposited! You received Demo vS (D-vS) tokens.');
      // Reload balances and NFT data
      await loadBalances();
    } catch (error) {
      console.error('Error depositing to vault:', error);
      setStatus('Deposit failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const redeemFromVault = async (amount: string) => {
    if (!walletClient || !address || !amount) return;

    setIsLoading(true);
    setStatus('Redeeming from vault...');
    try {
      const amountWei = ethers.parseEther(amount);
      
      const hash = await walletClient.writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vSVaultArtifact.abi,
        functionName: 'redeem',
        args: [amountWei],
      });

      setTxHash(hash);
      console.log('Redeem transaction sent:', hash);

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      console.log('Redeem confirmed:', receipt);

      setStatus('Redeemed! You received underlying tokens.');
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
        abi: vSVaultArtifact.abi,
        functionName: 'claimVested',
        args: [0, 10], // Claim first 10 NFTs
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
      {/* Header with explanation */}
      <div className="content-card" style={{ marginBottom: 16, background: '#fffbe6', border: '1px solid #ffe066', color: '#856404' }}>
        <b>🏦 vS Vault Protocol - Complete Demo:</b> This demo showcases the full vS Vault functionality on Sonic mainnet. Mint fNFTs, deposit them into the vault for liquid vS tokens, and redeem your underlying assets.
      </div>

      <div className="content-card" style={{ marginBottom: 24, background: '#f7f9fc', border: '1px solid #eaecef' }}>
        <h1 style={{ margin: 0, fontSize: 24, color: '#1F6BFF' }}>🏦 vS Vault Protocol Demo</h1>
        <div style={{ marginTop: 12, color: '#555', fontSize: 15 }}>
          <div style={{ background: '#fff3cd', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #ffeaa7' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#d68910' }}>💰 The Sonic Airdrop Problem</h3>
            <p style={{ margin: '0 0 8px 0' }}>
              <b>Sonic airdrops give you fNFTs</b> - these are "future NFTs" that unlock Sonic tokens slowly over 9 months. 
              You can't sell them, trade them, or use them in DeFi. <b>They're locked until they vest.</b>
            </p>
          </div>
          
          <div style={{ background: '#d1f2eb', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #7dcea0' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0e6b0e' }}>🔓 Our Solution: Instant Liquidity</h3>
            <ol style={{ margin: '0 0 12px 0', paddingLeft: 20 }}>
              <li><b>Deposit your fNFT:</b> Put your locked airdrop into our vault <i>(locked forever)</i></li>
              <li><b>Get D-vS tokens instantly:</b> Receive liquid tokens worth your <b>full future value</b></li>
              <li><b>Trade immediately:</b> Swap D-vS for Sonic tokens anytime - no waiting!</li>
              <li><b>Or keep earning:</b> Return weekly to claim more D-vS as your airdrop unlocks</li>
            </ol>
            <div style={{ background: '#a9dfbf', padding: 8, borderRadius: 4, fontSize: 14 }}>
              <b>🎯 Key:</b> Your fNFT gets locked forever, but you get liquid D-vS tokens representing its value. 
              Sell immediately at a discount, or wait for full vesting value.
            </div>
          </div>
        </div>
      </div>

      {!isConnected ? (
        <div className="content-card" style={{ textAlign: 'center', padding: 40 }}>
          <h2>Connect Your Wallet</h2>
          <p>Connect your wallet to start testing the vS Vault Protocol</p>
          <button onClick={openConnectModal} className="button-primary" style={{ padding: '12px 24px', fontSize: 16 }}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          <div className="content-card" style={{ marginBottom: 16 }}>
            <h3>👤 Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
              <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, border: '1px solid #eaecef' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>🎫 fNFTs Owned</h4>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{fNFTBalance}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, border: '1px solid #eaecef' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>💰 tS Balance</h4>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{Number(underlyingBalance).toFixed(2)}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, border: '1px solid #eaecef' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>⚡ vS Balance</h4>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{Number(vsBalance).toFixed(2)}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, border: '1px solid #eaecef' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>🏦 Vault Assets</h4>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{Number(vaultBalance).toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="content-card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #eaecef', marginBottom: 16 }}>
              <button 
                style={{ 
                  padding: '8px 16px', 
                  border: 'none', 
                  background: activeTab === 'mint' ? '#1F6BFF' : 'transparent',
                  color: activeTab === 'mint' ? 'white' : '#666',
                  borderRadius: '4px 4px 0 0',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTab('mint')}
              >
                🎟️ Mint fNFTs
              </button>
              <button 
                style={{ 
                  padding: '8px 16px', 
                  border: 'none', 
                  background: activeTab === 'vault' ? '#1F6BFF' : 'transparent',
                  color: activeTab === 'vault' ? 'white' : '#666',
                  borderRadius: '4px 4px 0 0',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTab('vault')}
              >
                🏦 Vault Operations
              </button>
              <button 
                style={{ 
                  padding: '8px 16px', 
                  border: 'none', 
                  background: activeTab === 'trade' ? '#1F6BFF' : 'transparent',
                  color: activeTab === 'trade' ? 'white' : '#666',
                  borderRadius: '4px 4px 0 0',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTab('trade')}
              >
                🌙 Shadow DEX
              </button>
            </div>

            {activeTab === 'mint' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
                  <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8, border: '1px solid #eaecef' }}>
                    <h3 style={{ margin: '0 0 12px 0' }}>🔥 Get Test Tokens</h3>
                    <p style={{ margin: '0 0 16px 0' }}>Mint yourself 1,000 tS tokens for testing</p>
                    <button
                      onClick={mintTokens}
                      disabled={isLoading}
                      className="button-primary"
                      style={{ width: '100%' }}
                    >
                      {isLoading ? 'Minting...' : 'Get 1,000 tS'}
                    </button>
                  </div>

                  <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8, border: '1px solid #eaecef' }}>
                    <h3 style={{ margin: '0 0 12px 0' }}>🎟️ Mint fNFT</h3>
                    <p style={{ margin: '0 0 16px 0' }}>Create a new vesting NFT (10,000 tS, 9 months vesting)</p>
                    <button
                      onClick={mintfNFT}
                      disabled={isLoading}
                      className="button-primary"
                      style={{ width: '100%' }}
                    >
                      {isLoading ? 'Minting...' : 'Mint fNFT'}
                    </button>
                  </div>
                </div>

                {ownedNFTs.length > 0 && (
                  <div>
                    <h3>🎫 Your fNFTs</h3>
                    <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
                      {ownedNFTs.map((nft) => (
                        <div key={nft.tokenId} style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #eaecef' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <h4 style={{ margin: 0 }}>fNFT #{nft.tokenId}</h4>
                            <div style={{ background: '#e6f7ff', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                              {nft.progress}% unlocked
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 16, fontSize: 14 }}>
                            <div><strong>Total:</strong> {Number(nft.totalAmount).toFixed(2)} tS</div>
                            <div><strong>Claimed:</strong> {Number(nft.claimedAmount).toFixed(2)} tS</div>
                            <div><strong>Available:</strong> {Number(nft.availableAmount).toFixed(2)} tS</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => claimVested(nft.tokenId)}
                              disabled={isLoading || parseFloat(nft.availableAmount) === 0}
                              className="button-primary"
                              style={{ flex: 1 }}
                            >
                              {isLoading ? 'Claiming...' : `Claim ${Number(nft.availableAmount).toFixed(2)} tS`}
                            </button>
                            <button
                              onClick={() => depositToVault(nft.tokenId)}
                              disabled={isLoading}
                              className="button-primary"
                              style={{ flex: 1, background: '#28a745' }}
                            >
                              {isLoading ? 'Depositing...' : 'Deposit to Vault'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'vault' && (
              <div>
                <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>🏦 Vault Information</h3>
                  <p style={{ margin: '0 0 12px 0' }}>The vault holds fNFTs and allows you to mint liquid vS tokens against their full future value.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div>
                      <span style={{ color: '#666' }}>Your D-vS Balance:</span>
                      <div style={{ fontSize: 18, fontWeight: 'bold' }}>{Number(vsBalance).toFixed(2)} D-vS</div>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Total Vault Assets:</span>
                      <div style={{ fontSize: 18, fontWeight: 'bold' }}>{Number(vaultBalance).toFixed(2)} tS</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                  <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8, border: '1px solid #eaecef' }}>
                    <h3 style={{ margin: '0 0 12px 0' }}>💰 Redeem vS Tokens</h3>
                    <p style={{ margin: '0 0 16px 0' }}>Burn vS tokens to get your share of underlying tS tokens</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="number"
                        placeholder="Amount of vS to redeem"
                        id="redeem-amount"
                        step="0.1"
                        max={vsBalance}
                        style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('redeem-amount') as HTMLInputElement;
                          redeemFromVault(input.value);
                        }}
                        disabled={isLoading || parseFloat(vsBalance) === 0}
                        className="button-primary"
                      >
                        {isLoading ? 'Redeeming...' : 'Redeem'}
                      </button>
                    </div>
                  </div>

                  <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8, border: '1px solid #eaecef' }}>
                    <h3 style={{ margin: '0 0 12px 0' }}>⚡ Claim Vault Vested Tokens</h3>
                    <p style={{ margin: '0 0 16px 0' }}>Anyone can call this to claim vested tokens from vault's fNFTs</p>
                    <button
                      onClick={claimVaultVested}
                      disabled={isLoading}
                      className="button-primary"
                      style={{ width: '100%' }}
                    >
                      {isLoading ? 'Claiming...' : 'Claim Vault Vested'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trade' && (
              <div>
                <div style={{ background: '#f0f8f0', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>🌙 Shadow DEX Integration</h3>
                  <p style={{ margin: '0 0 12px 0' }}>Trade your D-vS tokens for immediate liquidity on Sonic's premier DEX</p>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    <strong>Live Pool:</strong> <a href="https://www.shadow.so/liquidity/manage/0x85e6cee8ddac8426ebaa1f2191f5969774c5351e" target="_blank" rel="noopener noreferrer" style={{ color: '#1F6BFF' }}>D-vS/tS Pool</a>
                  </div>
                </div>

                <ShadowDEXIntegration
                  dvsTokenAddress={VSTOKEN_ADDRESS}
                  tsTokenAddress={MOCKTOKEN_ADDRESS}
                  userDvSBalance={vsBalance}
                  onTradeComplete={(amountOut) => {
                    setStatus(`✅ Successfully traded D-vS for ${amountOut} tS on Shadow DEX!`);
                    loadBalances(); // Refresh balances after trade
                  }}
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

          <div className="demo-cards">
            <div className="demo-card problem">
              <div className="problem-badge">�� THE PROBLEM</div>
              <h3>Your Sonic Airdrop is Locked Forever</h3>
              <div className="nft-display">
                <div className="nft-card locked">
                  <div className="nft-header">
                    <span className="nft-title">fNFT #{ownedNFTs.length > 0 ? ownedNFTs[0].tokenId : '...'}</span>
                    <span className="locked-badge">🔒 LOCKED</span>
                  </div>
                  <div className="nft-stats">
                    <div className="stat">
                      <span className="label">Total Value</span>
                      <span className="value">{ownedNFTs.length > 0 ? ownedNFTs[0].totalAmount : '0.0'} tS</span>
                    </div>
                    <div className="stat">
                      <span className="label">Available Now</span>
                      <span className="value">{ownedNFTs.length > 0 ? ownedNFTs[0].claimedAmount : '0.0'} tS</span>
                    </div>
                    <div className="stat">
                      <span className="label">Still Locked</span>
                      <span className="value red">{ownedNFTs.length > 0 ? (Number(ownedNFTs[0].totalAmount) - Number(ownedNFTs[0].claimedAmount)).toFixed(2) : '0.0'} tS</span>
                    </div>
                    <div className="stat">
                      <span className="label">Vesting Period</span>
                      <span className="value">9 months remaining</span>
                    </div>
                  </div>
                  <div className="nft-actions">
                    <button 
                      onClick={() => claimVested(ownedNFTs[0].tokenId)}
                      disabled={ownedNFTs.length === 0 || parseFloat(ownedNFTs[0].claimedAmount) === 0}
                      className={`action-btn ${ownedNFTs.length === 0 || parseFloat(ownedNFTs[0].claimedAmount) === 0 ? 'disabled' : 'claim'}`}
                    >
                      {ownedNFTs.length === 0 ? 'Loading...' : isLoading ? 'Claiming...' : `Claim ${ownedNFTs[0].claimedAmount} tS`}
                    </button>
                  </div>
                </div>
              </div>
              <div className="problem-explanation">
                <p><strong>You can't sell, transfer, or use your fNFT as collateral.</strong></p>
                <p>Your {ownedNFTs.length > 0 ? ownedNFTs[0].totalAmount : '0.0'} tS is stuck for 9 months!</p>
              </div>
            </div>

            <div className="demo-card solution">
              <div className="solution-badge">✨ THE SOLUTION</div>
              <h3>Unlock Liquidity with vS Protocol</h3>
              
              {/* Step 1: Deposit */}
              <div className="solution-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Deposit Your fNFT</h4>
                  <p>Delegate your fNFT to the vault and get liquid D-vS tokens representing the full future value</p>
                  <div className="vault-action">
                    <button 
                      onClick={() => depositToVault(ownedNFTs[0].tokenId)}
                      disabled={ownedNFTs.length === 0 || isLoading}
                      className={`action-btn ${ownedNFTs.length === 0 || isLoading ? 'disabled' : 'deposit'}`}
                    >
                      {ownedNFTs.length === 0 ? 'Loading...' : isLoading ? 'Depositing...' : 'Deposit fNFT & Get D-vS'}
                    </button>
                    {ownedNFTs.length > 0 && (
                      <div className="success-message">
                        ✅ Got {ownedNFTs[0].totalAmount} D-vS tokens! Your fNFT future value is now liquid.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Trade on Shadow DEX */}
              {ownedNFTs.length > 0 && (
                <div className="solution-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Trade on Shadow DEX</h4>
                    <p>Your D-vS tokens are now liquid! Trade them on Sonic's leading DEX.</p>
                    <div className="shadow-dex-demo">
                      <div className="trading-interface">
                        <div className="trade-header">
                          <div className="dex-logo">🌑 Shadow DEX</div>
                          <div className="pair-info">D-vS / tS Pool</div>
                        </div>
                        <div className="trade-form">
                          <div className="trade-input">
                            <label>Sell</label>
                            <div className="input-row">
                              <input 
                                type="number" 
                                placeholder="0.0" 
                                value={tradeAmount}
                                onChange={(e) => setTradeAmount(e.target.value)}
                                max={Number(vsBalance).toString()}
                              />
                              <span className="token">D-vS</span>
                            </div>
                            <div className="balance">Balance: {Number(vsBalance).toFixed(2)} D-vS</div>
                          </div>
                          <div className="trade-arrow">⬇</div>
                          <div className="trade-output">
                            <label>Receive (estimated)</label>
                            <div className="output-row">
                              <span className="amount">{tradeAmount ? (parseFloat(tradeAmount) * 0.85).toFixed(2) : '0.0'}</span>
                              <span className="token">tS</span>
                            </div>
                            <div className="exchange-rate">1 D-vS ≈ 0.85 tS (15% discount for immediate liquidity)</div>
                          </div>
                          <button 
                            onClick={executeTradeDemo}
                            disabled={!tradeAmount || parseFloat(tradeAmount) <= 0 || tradeExecuted || parseFloat(vsBalance) === 0}
                            className={`trade-btn ${!tradeAmount || parseFloat(tradeAmount) <= 0 || tradeExecuted || parseFloat(vsBalance) === 0 ? 'disabled' : 'trade'}`}
                          >
                            {tradeExecuted ? '✓ Trade Executed' : isLoading ? 'Trading...' : 'Swap on Shadow DEX'}
                          </button>
                          {tradeExecuted && (
                            <div className="trade-success">
                              🎉 Successfully traded {tradeAmount} D-vS for {(parseFloat(tradeAmount) * 0.85).toFixed(2)} tS!
                              <br />You now have immediate liquidity instead of waiting 9 months.
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Shadow DEX Features */}
                      <div className="dex-features">
                        <h5>Why Shadow DEX?</h5>
                        <ul>
                          <li>🏆 <strong>Dominant on Sonic:</strong> 60% of all trading volume</li>
                          <li>💰 <strong>MEV Protection:</strong> 100% MEV recycled back to LPs</li>
                          <li>⚡ <strong>Ultra-low fees:</strong> $0.0001 transaction costs</li>
                          <li>🔄 <strong>Deep liquidity:</strong> Minimal slippage for large trades</li>
                          <li>📈 <strong>Fee earning:</strong> LPs earn from high-frequency trading</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Alternative Options */}
              {ownedNFTs.length > 0 && (
                <div className="solution-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Or Hold & Redeem Later</h4>
                    <p>Keep your D-vS tokens and redeem them as the underlying fNFT vests</p>
                    <div className="redeem-option">
                      <button 
                        onClick={() => redeemFromVault(ownedNFTs[0].totalAmount)}
                        disabled={ownedNFTs.length === 0 || parseFloat(ownedNFTs[0].totalAmount) === 0 || isLoading}
                        className={`action-btn ${ownedNFTs.length === 0 || parseFloat(ownedNFTs[0].totalAmount) === 0 ? 'disabled' : 'redeem'}`}
                      >
                        {ownedNFTs.length === 0 ? 'Loading...' : isLoading ? 'Redeeming...' : `Redeem D-vS for Vested tS`}
                      </button>
                      <p className="redeem-note">
                        Redeem your D-vS tokens 1:1 for vested tS as the underlying fNFT unlocks over time
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <footer style={{ marginTop: 48, textAlign: 'center', color: '#888', fontSize: 14 }}>
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>Contract Addresses</h4>
          <div style={{ display: 'grid', gap: 4, fontSize: 12, textAlign: 'left', maxWidth: 600, margin: '0 auto' }}>
            <AddressRow label="fNFT" address={DECAYFNFT_ADDRESS} />
            <AddressRow label="tS Token" address={MOCKTOKEN_ADDRESS} />
            <AddressRow label="Demo vS Token (D-vS)" address={VSTOKEN_ADDRESS} />
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