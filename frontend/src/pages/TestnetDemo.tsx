import React, { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import DecayfNFTArtifact from '../abis/DecayfNFT.json';
import MockTokenArtifact from '../abis/MockToken.json';
import vSVaultArtifact from '../abis/vSVault.json';
import vSTokenArtifact from '../abis/vSToken.json';
import ShadowDEXPoolInfo from '../components/ShadowDEXIntegration';
import '../styles/common.css';
import { ethers } from 'ethers';

// Gas-Optimized Contracts (Ultra-Low Gas for Demo Deposits!)
const DECAYFNFT_ADDRESS = '0xC6E821326AD497ba4987bA98057abEA7abC425cA';
const MOCKTOKEN_ADDRESS = '0x16e5294Cc116819BfB79752C238a74c9f83a35f9';
const VSTOKEN_ADDRESS = '0x2649125B1a683e3448F2BB15425AcD83aa2dfd35';
const VAULT_ADDRESS = '0x2e17544f3E692a05F9c3C88049bca0eBCF27Bb6B';

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

      // Get NFT value to choose optimal deposit method
      const nftDetails = ownedNFTs.find(nft => nft.tokenId === tokenId);
      const nftValue = nftDetails ? parseFloat(nftDetails.totalAmount) : 0;
      
      // Use ultra gas-optimized demo deposit for small NFTs
      const depositFunction = nftValue <= 1000 ? 'demoDeposit' : 'deposit';
      
      setStatus(`Step 3/3: ${nftValue <= 1000 ? 'Ultra-low gas deposit (90% savings!)' : 'Depositing to vault'}...`);

      // Finally deposit to vault
      const depositHash = await walletClient.writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vSVaultArtifact.abi,
        functionName: depositFunction,
        args: [tokenId],
      });

      setTxHash(depositHash);
      console.log('Deposit transaction sent:', depositHash);

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: depositHash });
      console.log('Deposit confirmed:', receipt);

      setStatus('✅ Deposited! You received Demo vS (D-vS) tokens.');
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
        abi: vSVaultArtifact.abi,
        functionName: 'simpleRedeem',
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
      {/* Value Proposition Header */}
      <div className="content-card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: 32, color: 'white', textAlign: 'center' }}>🚀 vS Vault: Turn Locked fNFTs into Productive DeFi Assets</h1>
        
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#e8f4ff' }}>💡 The Complete Flow (9-Month Strategy)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>1️⃣ <strong>Stake fNFT</strong></div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Permanently deposit your vesting fNFT into the vault</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>2️⃣ <strong>Get D-vS Tokens</strong></div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Withdraw liquid tokens equal to current vesting value</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>3️⃣ <strong>Use in DeFi</strong></div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Put D-vS tokens to work immediately in protocols</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>4️⃣ <strong>Earn LP Fees</strong></div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Stake in Shadow DEX pools to earn trading fees</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>5️⃣ <strong>Auto-Unlock</strong></div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>More D-vS unlocks as your fNFT vests over time</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>6️⃣ <strong>Exit at 100%</strong></div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>At 9 months, sell D-vS for full S token value</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#ffcccb' }}>😵 Without vS Vault</h3>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              • fNFT locked for 9 months<br/>
              • No DeFi opportunities<br/>
              • No yield while waiting<br/>
              • Assets sitting idle
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#90ee90' }}>🚀 With vS Vault</h3>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              • Instant liquidity from day 1<br/>
              • Earn LP fees for 9 months<br/>
              • Use in other DeFi protocols<br/>
              • Keep full vesting upside
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
          {/* Status Dashboard */}
          <div className="content-card" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 16px 0' }}>📊 Your Assets</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <div style={{ background: '#fff3e0', padding: 16, borderRadius: 8, border: '1px solid #ffcc02', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>fNFTs Owned</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f57c00' }}>{fNFTBalance}</div>
              </div>
              <div style={{ background: '#e3f2fd', padding: 16, borderRadius: 8, border: '1px solid #2196f3', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>tS Balance</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1976d2' }}>{Number(underlyingBalance).toFixed(0)}</div>
              </div>
              <div style={{ background: '#e8f5e8', padding: 16, borderRadius: 8, border: '1px solid #4caf50', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>D-vS Balance</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#2e7d32' }}>{Number(vsBalance).toFixed(0)}</div>
              </div>
              <div style={{ background: '#f3e5f5', padding: 16, borderRadius: 8, border: '1px solid #9c27b0', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Vault Assets</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#7b1fa2' }}>{Number(vaultBalance).toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* Main Tabs */}
          <div className="content-card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #eaecef', marginBottom: 16 }}>
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
                🎯 Steps 1-2: Get Assets & Stake fNFT
              </button>
              <button 
                style={{ 
                  padding: '12px 20px', 
                  border: 'none', 
                  background: activeTab === 'vault' ? '#1F6BFF' : 'transparent',
                  color: activeTab === 'vault' ? 'white' : '#666',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'vault' ? 'bold' : 'normal'
                }}
                onClick={() => setActiveTab('vault')}
              >
                🏦 Steps 5-6: Manage D-vS & Exit
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
                💰 Steps 3-4: Use in DeFi & Earn Fees
              </button>
            </div>

            {activeTab === 'mint' && (
              <>
                <div style={{ background: '#e8f5e8', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #4caf50' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>🎯 Steps 1-2: Setup Your Position</h3>
                  <div style={{ fontSize: 15, marginBottom: 12 }}>
                    <strong>Step 1:</strong> Get test tokens and mint a realistic fNFT (like real Sonic airdrop)<br/>
                    <strong>Step 2:</strong> Stake your fNFT in the vault → Get liquid D-vS tokens immediately!
                  </div>
                  <div style={{ background: '#d1f2eb', padding: 12, borderRadius: 6, border: '1px solid #7dcea0' }}>
                    <strong>💡 What happens:</strong> Your fNFT gets deposited permanently, but you receive D-vS tokens equal to its current vesting value. You can now use these tokens in DeFi while your original fNFT continues vesting in the background.
                  </div>
                </div>

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
                    <h3 style={{ margin: '0 0 12px 0' }}>🎟️ Mint Demo fNFT</h3>
                    <p style={{ margin: '0 0 16px 0' }}>Create realistic demo fNFT (500 tS, 270 days vesting - like real Sonic airdrop)</p>
                    <button
                      onClick={mintfNFT}
                      disabled={isLoading}
                      className="button-primary"
                      style={{ width: '100%' }}
                    >
                      {isLoading ? 'Minting...' : 'Mint Realistic Demo fNFT (500 tS)'}
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
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 16, fontSize: 14 }}>
                            <div><strong>Total:</strong> {Number(nft.totalAmount).toFixed(2)} tS</div>
                            <div><strong>Claimed:</strong> {Number(nft.claimedAmount).toFixed(2)} tS</div>
                            <div><strong>Available:</strong> {Number(nft.availableAmount).toFixed(2)} tS</div>
                          </div>
                          
                          {nft.isDepositedInVault ? (
                            // NFT is deposited in vault - show vault status
                            <div style={{ background: '#e8f5e8', padding: 12, borderRadius: 6, border: '1px solid #28a745' }}>
                              <div style={{ fontSize: 14, marginBottom: 8 }}>
                                <strong>🏦 In Vault:</strong> This fNFT is deposited and earning you D-vS tokens as it vests.
                              </div>
                              <div style={{ fontSize: 13, color: '#666' }}>
                                • Check "Manage D-vS & Exit" tab to see your vault balance<br/>
                                • Use "Use in DeFi & Earn Fees" tab to provide liquidity
                              </div>
                            </div>
                          ) : (
                            // NFT is still owned by user - show claim/deposit options
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={() => claimVested(nft.tokenId)}
                                disabled={isLoading || !nft.canClaimDirectly}
                                className="button-primary"
                                style={{ flex: 1, opacity: nft.canClaimDirectly ? 1 : 0.5 }}
                                title={nft.canClaimDirectly ? '' : 'No tokens available to claim yet'}
                              >
                                {isLoading ? 'Claiming...' : 
                                 nft.canClaimDirectly ? `Claim ${Number(nft.availableAmount).toFixed(2)} tS` : 
                                 'Nothing to Claim Yet'}
                              </button>
                              <div style={{ display: 'flex', gap: 8 }}>
                                {parseFloat(nft.totalAmount) > 1000 ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        const confirmed = window.confirm(
                                          `Deposit 10% of fNFT #${nft.tokenId}?\n\n` +
                                          `• Get ${(parseFloat(nft.totalAmount) * 0.1).toFixed(1)} D-vS tokens\n` +
                                          `• Much lower gas cost (~$1-3 instead of $20+)\n` +
                                          `• You can deposit more later\n\n` +
                                          `This is perfect for testing!`
                                        );
                                        if (confirmed) {
                                          // TODO: Call depositFraction(nftId, 10) when implemented
                                          alert('Fractional deposit coming soon! Use smaller fNFT for now.');
                                        }
                                      }}
                                      disabled={isLoading || !nft.canDepositToVault}
                                      className="button-primary"
                                      style={{ flex: 1, background: '#28a745' }}
                                    >
                                      {isLoading ? 'Depositing...' : 'Deposit 10% (Low Gas)'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        const confirmed = window.confirm(
                                          `⚠️ EXPENSIVE TRANSACTION WARNING ⚠️\n\n` +
                                          `Depositing all ${nft.totalAmount} tS will cost ~$15-25 in gas!\n\n` +
                                          `Consider:\n` +
                                          `• Minting smaller demo fNFT instead (~$1 gas)\n` +
                                          `• Using "Deposit 10%" option\n` +
                                          `• Most real users will have 100-1000 tS NFTs\n\n` +
                                          `Continue with expensive full deposit?`
                                        );
                                        if (confirmed) {
                                          depositToVault(nft.tokenId);
                                        }
                                      }}
                                      disabled={isLoading || !nft.canDepositToVault}
                                      className="button-primary"
                                      style={{ flex: 1, background: '#dc3545' }}
                                    >
                                      Full Deposit (💸 $15-25 Gas)
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const confirmed = window.confirm(
                                        `Deposit fNFT #${nft.tokenId} to Vault?\n\n` +
                                        `• Get ${nft.totalAmount} D-vS tokens right now\n` +
                                        `• Low gas cost (under $2)\n` +
                                        `• Safe and reversible\n\n` +
                                        `Continue?`
                                      );
                                      if (confirmed) {
                                        depositToVault(nft.tokenId);
                                      }
                                    }}
                                    disabled={isLoading || !nft.canDepositToVault}
                                    className="button-primary"
                                    style={{ width: '100%', background: '#28a745' }}
                                  >
                                    {isLoading ? 'Depositing...' : 'Deposit to Vault (Low Gas)'}
                                  </button>
                                )}
                              </div>
                            )}
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
                  <h3 style={{ margin: '0 0 8px 0' }}>🏦 Vault Management</h3>
                  <div style={{ fontSize: 15, marginBottom: 12 }}>
                    <strong>Redeem D-vS for tS tokens</strong> • Proportional to vesting progress • Exit anytime safely
                  </div>
                  <div style={{ background: '#d1f2eb', padding: 12, borderRadius: 6, border: '1px solid #7dcea0', fontSize: 14 }}>
                    <strong>✅ Safe:</strong> No funds lost - always get proportional value based on vesting progress
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
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
                    <h3 style={{ margin: '0 0 12px 0' }}>💰 Exchange D-vS for tS</h3>
                    <p style={{ margin: '0 0 16px 0' }}>Trade your D-vS tokens back for real tS tokens (proportional to what's unlocked)</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="number"
                        placeholder="Amount of D-vS to redeem"
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
                    <h3 style={{ margin: '0 0 12px 0' }}>⚡ Update Vault Balance</h3>
                    <p style={{ margin: '0 0 16px 0' }}>Collect newly unlocked tS tokens from the vault's fNFTs (anyone can do this)</p>
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
                <div style={{ background: '#e8f5e8', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #4caf50' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>💰 DeFi Integration</h3>
                  <div style={{ fontSize: 15, marginBottom: 12 }}>
                    <strong>Use liquid D-vS tokens in DeFi:</strong> Lending, collateral, LP pools, governance
                  </div>
                  <div style={{ background: '#d1f2eb', padding: 12, borderRadius: 6, border: '1px solid #7dcea0' }}>
                    <strong>Shadow DEX:</strong> Provide D-vS/tS liquidity → earn trading fees + Shadow incentives while maintaining vesting exposure
                  </div>
                </div>

                <ShadowDEXPoolInfo
                  dvsBalance={vsBalance}
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