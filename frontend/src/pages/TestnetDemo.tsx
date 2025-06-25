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

const Demo: React.FC = () => {
  const { address: account, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [nfts, setNfts] = useState<any[]>([]);
  const [tsBalance, setTsBalance] = useState('0');
  const [tvsBalance, setTvsBalance] = useState('0');
  const [status, setStatus] = useState<string>('');
  const [mintPrincipal, setMintPrincipal] = useState('');

  // Fetch user's NFTs and balances
  const fetchNFTsAndBalances = async () => {
    if (!walletClient || !account) return;
    setStatus('Fetching your balances and NFTs...');
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
    const maxTokenId = 50;
    const userNFTs: any[] = [];
    for (let tokenId = 0; tokenId < maxTokenId; tokenId++) {
      try {
        const owner = await decayfNFT.ownerOf(tokenId);
        if (owner.toLowerCase() === account.toLowerCase()) {
          const vesting = await decayfNFT.vestingSchedules(tokenId);
          userNFTs.push({
            tokenId,
            principal: Number(vesting.principalAmount.toString()),
            claimed: Number(vesting.claimedAmount.toString()),
            start: Number(vesting.vestingStart.toString()),
            duration: Number(vesting.vestingDuration.toString()),
          });
        }
      } catch {}
    }
    setNfts(userNFTs);
    setStatus('');
  };

  useEffect(() => {
    if (walletClient && account) fetchNFTsAndBalances();
    // eslint-disable-next-line
  }, [walletClient, account]);

  const handleFaucet = async () => {
    if (!walletClient || !account) return;
    setStatus('Requesting tS from faucet...');
    try {
      const provider = new ethers.JsonRpcProvider(publicClient?.transport.url);
      const tsToken = new ethers.Contract(MOCKTOKEN_ADDRESS, MockTokenArtifact.abi, provider);
      const tx = await tsToken.connect(walletClient).faucet();
      await tx.wait();
      setStatus('Faucet success! You received 1000 tS.');
      fetchNFTsAndBalances();
    } catch (err) {
      setStatus('Faucet failed.');
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletClient || !account) return;
    setStatus('Minting your fNFT...');
    try {
      const provider = new ethers.JsonRpcProvider(publicClient?.transport.url);
      const tsToken = new ethers.Contract(MOCKTOKEN_ADDRESS, MockTokenArtifact.abi, provider);
      // Approve tS for minting
      const approveTx = await tsToken.connect(walletClient).approve(DECAYFNFT_ADDRESS, mintPrincipal);
      await approveTx.wait();
      const decayfNFT = new ethers.Contract(DECAYFNFT_ADDRESS, DecayfNFTArtifact.abi, provider);
      const tx = await decayfNFT.connect(walletClient).safeMint(account, mintPrincipal, '23328000');
      await tx.wait();
      setStatus('Minted! You now have a new fNFT.');
      setMintPrincipal('');
      fetchNFTsAndBalances();
    } catch (err) {
      setStatus('Mint failed.');
    }
  };

  const handleClaim = async (tokenId: number) => {
    if (!walletClient || !account) return;
    setStatus('Claiming vested tS...');
    try {
      const provider = new ethers.JsonRpcProvider(publicClient?.transport.url);
      const decayfNFT = new ethers.Contract(DECAYFNFT_ADDRESS, DecayfNFTArtifact.abi, provider);
      const tx = await decayfNFT.connect(walletClient).claimVestedTokens(tokenId);
      await tx.wait();
      setStatus('Claimed!');
      fetchNFTsAndBalances();
    } catch (err) {
      setStatus('Claim failed.');
    }
  };

  // Eli15 steps
  return (
    <div className="page-container">
      {/* Eli15 Explainer */}
      <div className="content-card" style={{ marginBottom: 16, background: '#fffbe6', border: '1px solid #ffe066', color: '#856404' }}>
        <b>Note:</b> Because the FNFTs are not live from the Sonic AirDrop for this demo, you have to mint your own to see how the user flow works for the rest of the project.
      </div>
      <div className="content-card" style={{ marginBottom: 24, background: '#f7f9fc', border: '1px solid #eaecef' }}>
        <h1 style={{ margin: 0, fontSize: 24, color: '#1F6BFF' }}>Sonic Mainnet Vesting Demo (Eli15)</h1>
        <ol style={{ fontSize: 16, color: '#333', margin: '16px 0 0 0', paddingLeft: 24 }}>
          <li><b>Get tS:</b> Click the faucet to get free Sonic tokens (tS) for testing.</li>
          <li><b>Mint fNFT:</b> Lock your tS into a vesting NFT (fNFT). 25% is claimable now, 75% unlocks over 9 months.</li>
          <li><b>Claim:</b> As time passes, claim your unlocked tS from your fNFT.</li>
        </ol>
        <div style={{ marginTop: 12, color: '#555', fontSize: 15 }}>
          <b>What is this?</b> This is a real, live demo on Sonic mainnet. All tokens and NFTs are on-chain. Anyone can try it!
        </div>
      </div>
      <div className="content-card" style={{ marginBottom: 24 }}>
        <h2>Step 1: Get tS (Faucet)</h2>
        <p>Click to get 1000 tS tokens for free. You need tS to mint an fNFT.</p>
        <button className="button-primary" onClick={handleFaucet} disabled={!isConnected}>Get tS</button>
        <div style={{ marginTop: 8, color: '#888' }}>Your tS balance: <b>{Number(tsBalance).toLocaleString()} tS</b></div>
      </div>
      <div className="content-card" style={{ marginBottom: 24 }}>
        <h2>Step 2: Mint a Vesting NFT (fNFT)</h2>
        <p>Lock your tS into a vesting NFT. 25% is claimable now, 75% unlocks over 9 months.</p>
        <form onSubmit={handleMint} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="number"
            className="form-input"
            placeholder="Amount of tS to lock (e.g. 1000)"
            value={mintPrincipal}
            onChange={e => setMintPrincipal(e.target.value)}
            min={1}
            required
            style={{ width: 220 }}
          />
          <button className="button-primary" type="submit" disabled={!isConnected || !mintPrincipal}>Mint fNFT</button>
        </form>
      </div>
      <div className="content-card" style={{ marginBottom: 24 }}>
        <h2>Step 3: Your fNFTs (Claim as they vest)</h2>
        <p>Each fNFT unlocks tS over time. Click "Claim" to get your unlocked tokens.</p>
        {nfts.length === 0 ? (
          <div style={{ color: '#888' }}>You don't own any fNFTs yet.</div>
        ) : (
          <table className="activity-table" style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Principal</th>
                <th>Claimed</th>
                <th>Start</th>
                <th>Duration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {nfts.map(nft => (
                <tr key={nft.tokenId}>
                  <td>{nft.tokenId}</td>
                  <td>{Number(nft.principal).toLocaleString()} tS</td>
                  <td>{Number(nft.claimed).toLocaleString()} tS</td>
                  <td>{nft.start}</td>
                  <td>{nft.duration}</td>
                  <td>
                    <button className="button-primary" onClick={() => handleClaim(nft.tokenId)} disabled={!isConnected}>Claim</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {status && <div className="content-card" style={{ textAlign: 'center', color: '#007BFF' }}>Status: {status}</div>}
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

export default Demo; 