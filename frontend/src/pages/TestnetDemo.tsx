import React, { useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';
import DecayfNFTArtifact from '../abis/DecayfNFT.json';
import MockTokenArtifact from '../abis/MockToken.json';
import '../styles/common.css';

// TODO: Replace with actual deployed addresses
const DECAYFNFT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const MOCKTOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Sonic Mainnet Demo addresses (to be filled after deploy)
const DEMODECAYFNFT_ADDRESS = 'TODO_DEMODECAYFNFT_ADDRESS';
const DEMOTOKEN_ADDRESS = 'TODO_DEMOTOKEN_ADDRESS';

const decayfNFTAbi = DecayfNFTArtifact.abi;
const mockTokenAbi = MockTokenArtifact.abi;

const TestnetDemo: React.FC = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>('');
  const [nfts, setNfts] = useState<any[]>([]);
  const [mintPrincipal, setMintPrincipal] = useState('');
  const [mintDuration, setMintDuration] = useState('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if ((window as any).ethereum) {
      const prov = new BrowserProvider((window as any).ethereum);
      setProvider(prov);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return;
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    setSigner(signer);
    setAccount(await signer.getAddress());
  };

  // Fetch user's NFTs by scanning token IDs (for demo; TODO: use events/subgraph for scale)
  const fetchNFTs = async () => {
    if (!signer || !account) return;
    setStatus('Fetching NFTs...');
    const contract = new ethers.Contract(DECAYFNFT_ADDRESS, decayfNFTAbi, provider);
    const maxTokenId = 20; // TODO: Adjust as needed for demo
    const userNFTs: any[] = [];
    for (let tokenId = 0; tokenId < maxTokenId; tokenId++) {
      try {
        const owner = await contract.ownerOf(tokenId);
        if (owner.toLowerCase() === account.toLowerCase()) {
          const vesting = await contract.vestingSchedules(tokenId);
          const claimed = vesting.claimedAmount.toString();
          const principal = vesting.principalAmount.toString();
          const start = vesting.vestingStart.toString();
          const duration = vesting.vestingDuration.toString();
          const claimable = (await contract.claimable(tokenId)).toString();
          userNFTs.push({ tokenId, principal, start, duration, claimed, claimable });
        }
      } catch (e) {
        // tokenId not minted or error
      }
    }
    setNfts(userNFTs);
    setStatus('');
  };

  useEffect(() => {
    if (signer && account) fetchNFTs();
    // eslint-disable-next-line
  }, [signer, account]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) return;
    setStatus('Minting...');
    try {
      const contract = new ethers.Contract(DECAYFNFT_ADDRESS, decayfNFTAbi, signer);
      const tx = await contract.safeMint(account, mintPrincipal, mintDuration);
      await tx.wait();
      setStatus('Minted!');
      setMintPrincipal('');
      setMintDuration('');
      fetchNFTs();
    } catch (err) {
      setStatus('Mint failed');
    }
  };

  const handleClaim = async (tokenId: number) => {
    if (!signer) return;
    setStatus('Claiming...');
    try {
      const contract = new ethers.Contract(DECAYFNFT_ADDRESS, decayfNFTAbi, signer);
      const tx = await contract.claimVestedTokens(tokenId);
      await tx.wait();
      setStatus('Claimed!');
      fetchNFTs();
    } catch (err) {
      setStatus('Claim failed');
    }
  };

  return (
    <div className="page-container">
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
      {!account ? (
        <div className="content-card" style={{ textAlign: 'center' }}>
          <button className="button-primary" onClick={connectWallet}>Connect Wallet</button>
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
                <label>Duration (seconds)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 2592000 (30 days)"
                  value={mintDuration}
                  onChange={e => setMintDuration(e.target.value)}
                  required
                />
              </div>
              <button className="button-primary" type="submit">Mint</button>
            </form>
          </div>
          <div className="content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Your DecayfNFTs</h2>
              <button className="button-primary" onClick={fetchNFTs}>Refresh</button>
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
                      <th>Claimable</th>
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
                        <td>{nft.claimable}</td>
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
    </div>
  );
};

export default TestnetDemo; 