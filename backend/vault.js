const express = require('express');
const { ethers } = require('ethers');
const app = express();
const PORT = process.env.PORT || 4000;

// --- Config ---
const RPC_URL = process.env.RPC_URL || 'https://rpc.soniclabs.com'; // Replace with your RPC
const provider = new ethers.JsonRpcProvider(RPC_URL);

// --- Minimal ABIs ---
const MockfNFT_ABI = [
  'function claimable(uint256 tokenId) view returns (uint256)',
  'function penalty(uint256 tokenId) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)'
];

// --- Example addresses (replace with actual deployed addresses) ---
const VAULT_ADDRESS = '0xVaultAddress';
const FNFT_ADDRESS = '0xfNFTAddress';

// --- Endpoints ---
app.get('/vaults', (req, res) => {
  res.json([{ address: VAULT_ADDRESS, name: 'vS Vault' }]);
});

app.get('/vault/:address', (req, res) => {
  res.json({ address: req.params.address, nfts: [], totalAssets: 0 });
});

// Returns all NFTs held by the vault, with claimable and penalty values
app.get('/vault/:address/nfts', async (req, res) => {
  try {
    const vaultAddr = req.params.address;
    const nft = new ethers.Contract(FNFT_ADDRESS, MockfNFT_ABI, provider);
    const balance = await nft.balanceOf(vaultAddr);
    const nfts = [];
    for (let i = 0; i < balance; i++) {
      const tokenId = await nft.tokenOfOwnerByIndex(vaultAddr, i);
      const claimable = await nft.claimable(tokenId);
      const penalty = await nft.penalty(tokenId);
      nfts.push({ tokenId: tokenId.toString(), claimable: claimable.toString(), penalty: penalty.toString() });
    }
    res.json({ address: vaultAddr, nfts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch NFTs for vault' });
  }
});

app.listen(PORT, () => {
  console.log(`Vault API running on port ${PORT}`);
}); 