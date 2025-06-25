import React, { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import DecayfNFTArtifact from '../abis/DecayfNFT.json';
import MockTokenArtifact from '../abis/MockToken.json';
import '../styles/common.css';
import { ethers } from 'ethers';

// Sonic Mainnet Demo addresses
const DECAYFNFT_ADDRESS = '0xf211764E896d2A8C42D73BfadbFdEA455E87C32d'; // TestSonicDecayfNFT (tS-fNFT)
const MOCKTOKEN_ADDRESS = '0xe5d17D1Be55614b0a5356094DCd92Cf82E3D87De'; // TestSonicToken (tS)
const VSTOKEN_ADDRESS = '0xF580fCC22499F813bD0225403735E94f45E1a25a'; // VSToken (tvS)
const VAULT_ADDRESS = '0x22ee34ef29c7c070fBe4b8bC92A915F33Dd5cDcA'; // TestVault

const explorerBase = 'https://sonicscan.io/address/';

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

const decayfNFTAbi = DecayfNFTArtifact.abi;
const mockTokenAbi = MockTokenArtifact.abi;

const TestnetDemo: React.FC = () => {
  const { address: account, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [nfts, setNfts] = useState<any[]>([]);
  const [tsBalance, setTsBalance] = useState('0');
  const [tvsBalance, setTvsBalance] = useState('0');
  const [status, setStatus] = useState<string>('');
  const [vestingProgress, setVestingProgress] = useState(0);
  const [mintPrincipal, setMintPrincipal] = useState('');

  // Fetch user's NFTs and balances
  const fetchNFTsAndBalances = async () => {
    if (!walletClient || !account) return;
    setStatus('Fetching data...');
    const provider = new ethers.JsonRpcProvider(publicClient?.transport.url);
    const decayfNFT = new ethers.Contract(DECAYFNFT_ADDRESS, DecayfNFTArtifact.abi, provider);
    const tsToken = new ethers.Contract(MOCKTOKEN_ADDRESS, MockTokenArtifact.abi, provider);
    const vsToken = new ethers.Contract(VSTOKEN_ADDRESS, MockTokenArtifact.abi, provider);
    // Fetch tS and tvS balances
    const tsBal = await tsToken.balanceOf(account);
    setTsBalance(ethers.formatUnits(tsBal, 18));
    try {
      const tvsBal = await vsToken.balanceOf(account);
      setTvsBalance(ethers.formatUnits(tvsBal, 18));
    } catch {}
    // Fetch NFTs
    const maxTokenId = 20;
    const userNFTs: any[] = [];
    let totalPrincipal = 0;
    let totalClaimed = 0;
    let totalDuration = 0;
    let totalElapsed = 0;
    for (let tokenId = 0; tokenId < maxTokenId; tokenId++) {
      try {
        const owner = await decayfNFT.ownerOf(tokenId);
        if (owner.toLowerCase() === account.toLowerCase()) {
          const vesting = await decayfNFT.vestingSchedules(tokenId);
          const claimed = Number(vesting.claimedAmount.toString());
          const principal = Number(vesting.principalAmount.toString());
          const start = Number(vesting.vestingStart.toString());
          const duration = Number(vesting.vestingDuration.toString());
          const elapsed = Math.min(Math.max(0, Math.floor(Date.now() / 1000) - start), duration);
          userNFTs.push({ tokenId, principal, start, duration, claimed });
          totalPrincipal += principal;
          totalClaimed += claimed;
          totalDuration += duration;
          totalElapsed += elapsed;
        }
      } catch {}
    }
    setNfts(userNFTs);
    // Vesting progress (average across all NFTs)
    let progress = 0;
    if (userNFTs.length > 0 && totalDuration > 0) {
      progress = Math.round((totalElapsed / totalDuration) * 100);
    }
    setVestingProgress(progress);
    setStatus('');
  };

  useEffect(() => {
    if (walletClient && account) fetchNFTsAndBalances();
    // eslint-disable-next-line
  }, [walletClient, account]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletClient || !account) return;
    setStatus('Minting...');
    try {
      const signer = new ethers.Wallet(walletClient.account?.key as string, new ethers.JsonRpcProvider(publicClient?.transport.url));
      const contract = new ethers.Contract(DECAYFNFT_ADDRESS, decayfNFTAbi, signer);
      // Hardcode duration to 9 months (23328000 seconds)
      const fixedDuration = '23328000';
      const tx = await contract.safeMint(account, mintPrincipal, fixedDuration);
      await tx.wait();
      setStatus('Minted!');
      setMintPrincipal('');
      fetchNFTsAndBalances();
    } catch (err) {
      setStatus('Mint failed');
    }
  };

  const handleClaim = async (tokenId: number) => {
    if (!walletClient || !account) return;
    setStatus('Claiming...');
    try {
      const signer = new ethers.Wallet(walletClient.account?.key as string, new ethers.JsonRpcProvider(publicClient?.transport.url));
      const contract = new ethers.Contract(DECAYFNFT_ADDRESS, decayfNFTAbi, signer);
      const tx = await contract.claimVestedTokens(tokenId);
      await tx.wait();
      setStatus('Claimed!');
      fetchNFTsAndBalances();
    } catch (err) {
      setStatus('Claim failed');
    }
  };

  return (
    <div className="page-container">
      {/* Mainnet Live Protocol Intro Section */}
      <div className="content-card" style={{ marginBottom: 24, background: '#f7f9fc', border: '1px solid #eaecef' }}>
        <h1 style={{ margin: 0, fontSize: 24, color: '#1F6BFF' }}>Sonic Mainnet Vesting Protocol</h1>
        <p style={{ margin: '12px 0 0 0', color: '#333', fontSize: 16 }}>
          <b>This is a live, fully functional protocol on Sonic mainnet.</b><br/>
          All actions here interact with real, verified contracts on Sonic mainnet. Your wallet, tokens, and NFTs are on-chain and permanent.
        </p>
        <ul style={{ margin: '12px 0 0 0', color: '#444', fontSize: 15, paddingLeft: 20 }}>
          <li><b>1. Get tS:</b> Mint Sonic tokens (tS) to your wallet.</li>
          <li><b>2. Mint fNFT:</b> Lock tS into a vesting NFT (tS-fNFT). 25% is claimable now, 75% vests over 9 months.</li>
          <li><b>3. Deposit fNFT:</b> (Coming soon) Deposit your fNFT into the Vault to mint tvS (liquid Sonic) tokens.</li>
          <li><b>4. Redeem S:</b> (Coming soon) As your fNFT vests, burn tvS to redeem real S tokens.</li>
        </ul>
        <p style={{ margin: '12px 0 0 0', color: '#555', fontSize: 15 }}>
          <b>How does this work in a real airdrop?</b><br/>
          In a real Sonic airdrop, you'd receive an fNFT with your vested S. You could instantly claim 25%, and the rest would unlock over time. By depositing your fNFT in the Vault, you'd mint vS tokens—liquid, tradable, and redeemable as your S vests. This is the real protocol, live on mainnet.
        </p>
      </div>
      {/* Network Info Card */}
      <div className="content-card" style={{ marginBottom: 24, background: '#f8f9fa', border: '1px solid #eaecef' }}>
        <h2 style={{ margin: 0, fontSize: 18, color: '#1F6BFF' }}>Network Info</h2>
        <div style={{ marginTop: 8 }}>
          <AddressRow label="Vault" address={VAULT_ADDRESS} />
          <AddressRow label="tS (Token)" address={MOCKTOKEN_ADDRESS} />
          <AddressRow label="tS-fNFT" address={DECAYFNFT_ADDRESS} />
          <AddressRow label="tvS (vS Token)" address={VSTOKEN_ADDRESS} />
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#1F6BFF', fontWeight: 600 }}>
          Sonic Mainnet — Live Protocol
        </div>
      </div>
      <div className="community-banner" style={{marginBottom: 24, textAlign: 'center'}}>
        <span className="testnet-badge" style={{fontSize: '1rem', background: '#ffe066', color: '#856404', padding: '0.5rem 1.5rem', borderRadius: 8, fontWeight: 700, letterSpacing: 1}}>
          SONIC MAINNET DEMO — PUBLIC, FOR DEMONSTRATION ONLY
        </span>
        <div style={{marginTop: 8, color: '#856404', fontWeight: 500}}>
          These NFTs and tokens are for demo purposes only. They have no real value. Anyone can mint and claim.
        </div>
      </div>
      <h1 className="page-title">DecayfNFT Testnet Demo</h1>
      <div className="page-description">
        <b>Testnet Only:</b> This page is for demo/testing and not part of the main app. It replicates the main app's look and feel for a seamless experience.<br/>
        <span style={{color: '#888'}}>Protocol fees may be enabled in the future to fund sustainable, community-driven development.</span>
      </div>
      {!isConnected ? (
        <div className="content-card" style={{ textAlign: 'center' }}>
          <button className="button-primary" onClick={openConnectModal}>Connect Wallet</button>
        </div>
      ) : (
        <>
          <div className="content-card">
            <h2>Mint New DecayfNFT</h2>
            <form onSubmit={handleMint}>
              <div className="form-group">
                <label>Principal (wei)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 1000000000000000000"
                  value={mintPrincipal}
                  onChange={e => setMintPrincipal(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input
                  className="form-input"
                  value={"9 months (23328000 seconds)"}
                  disabled
                  style={{ color: '#888', background: '#f8f9fa' }}
                />
              </div>
              <button className="button-primary" type="submit">Mint</button>
            </form>
          </div>
          <div className="content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Your DecayfNFTs</h2>
              <button className="button-primary" onClick={fetchNFTsAndBalances}>Refresh</button>
            </div>
            {nfts.length === 0 ? <p>No NFTs found.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Principal</th>
                      <th>Start</th>
                      <th>Duration</th>
                      <th>Claimed</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nfts.map(nft => (
                      <tr key={nft.tokenId}>
                        <td>{nft.tokenId}</td>
                        <td>{nft.principal}</td>
                        <td>{nft.start}</td>
                        <td>{nft.duration}</td>
                        <td>{nft.claimed}</td>
                        <td>
                          <button className="button-primary" onClick={() => handleClaim(nft.tokenId)}>Claim</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="content-card">
            <h2>Get Demo Tokens</h2>
            <button className="button-primary" onClick={() => {
              // Implementation of getDemoTokens function
            }}>Get Demo Tokens</button>
          </div>
        </>
      )}
      {status && <div className="content-card" style={{ textAlign: 'center', color: '#007BFF' }}>Status: {status}</div>}
      <div style={{ marginTop: 32, color: '#888', textAlign: 'center' }}>
        <b>Note:</b> This is a minimal, isolated demo for testnet use only.
      </div>
      {/* Stat Cards */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: 24 }}>
        <div className="content-card stat-card-dash">
          <label>tS Balance</label>
          <span>{Number(tsBalance).toLocaleString()} tS</span>
        </div>
        <div className="content-card stat-card-dash">
          <label>tvS Balance</label>
          <span>{Number(tvsBalance).toLocaleString()} tvS</span>
        </div>
        <div className="content-card stat-card-dash">
          <label>tS-fNFTs Owned</label>
          <span>{nfts.length}</span>
        </div>
        <div className="content-card stat-card-dash">
          <label>Vesting Progress</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="progress-bar-container" style={{ width: 80, marginRight: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${vestingProgress}%`, background: '#1F6BFF', height: 8, borderRadius: 4 }}></div>
            </div>
            <span>{vestingProgress}%</span>
          </div>
        </div>
      </div>
      {/* Action Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: 32 }}>
        {/* Faucet */}
        <div className="content-card">
          <h3>Get tS (Faucet)</h3>
          <p>Mint 1000 tS tokens to your wallet for testing and interaction.</p>
          <button className="button-primary" onClick={async () => {
            setStatus('Requesting faucet...');
            try {
              const provider = new ethers.JsonRpcProvider(publicClient?.transport.url);
              const tsToken = new ethers.Contract(MOCKTOKEN_ADDRESS, MockTokenArtifact.abi, provider);
              const tx = await tsToken.connect(walletClient).faucet();
              await tx.wait();
              setStatus('Faucet success!');
              fetchNFTsAndBalances();
            } catch (err) {
              setStatus('Faucet failed');
            }
          }}>Get tS</button>
        </div>
        {/* Mint NFT */}
        <div className="content-card">
          <h3>Mint tS-fNFT</h3>
          <form onSubmit={handleMint}>
            <div className="form-group">
              <label>Principal (tS)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 1000"
                value={mintPrincipal}
                onChange={e => setMintPrincipal(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                className="form-input"
                value={"9 months (23328000 seconds)"}
                disabled
                style={{ color: '#888', background: '#f8f9fa' }}
              />
            </div>
            <button className="button-primary" type="submit">Mint tS-fNFT</button>
          </form>
        </div>
        {/* Deposit NFT (to Vault) */}
        <div className="content-card">
          <h3>Deposit tS-fNFT to Vault</h3>
          <p>Deposit your tS-fNFT to mint tvS tokens. (Coming soon: UI for deposit action)</p>
        </div>
        {/* Redeem tS (burn tvS) */}
        <div className="content-card">
          <h3>Redeem tS</h3>
          <p>Burn tvS to redeem vested tS as it becomes available. (Coming soon: UI for redeem action)</p>
        </div>
      </div>
      {/* Table for NFTs and Vault positions */}
      <div className="content-card" style={{ marginBottom: 32 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Your tS-fNFTs</h2>
        {nfts.length === 0 ? <p style={{ color: '#888' }}>You don't own any tS-fNFTs yet.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="activity-table" style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Principal</th>
                  <th>Start</th>
                  <th>Duration</th>
                  <th>Claimed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {nfts.map(nft => (
                  <tr key={nft.tokenId}>
                    <td>{nft.tokenId}</td>
                    <td>{Number(nft.principal).toLocaleString()} tS</td>
                    <td>{nft.start}</td>
                    <td>{nft.duration}</td>
                    <td>{Number(nft.claimed).toLocaleString()} tS</td>
                    <td>
                      <button className="button-primary" onClick={() => handleClaim(nft.tokenId)}>Claim</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Footer */}
      <footer style={{ marginTop: 48, textAlign: 'center', color: '#888', fontSize: 14 }}>
        <div style={{ marginBottom: 8 }}>
          <a href={`https://sonicscan.io/address/${VAULT_ADDRESS}`} target="_blank" rel="noopener noreferrer">View Vault on Sonic Explorer</a>
          {' | '}
          <a href="https://github.com/b1rdmania/vs-token-mvp" target="_blank" rel="noopener noreferrer">GitHub</a>
          {' | '}
          <a href="/docs" target="_blank" rel="noopener noreferrer">Docs</a>
        </div>
        <div>Sonic Mainnet &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
};

export default TestnetDemo; 