const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

// Placeholder: In real use, fetch from The Graph or chain
app.get('/vaults', (req, res) => {
  res.json([{ address: '0xVaultAddress', name: 'vS Vault' }]);
});

app.get('/vault/:address', (req, res) => {
  res.json({ address: req.params.address, nfts: [], totalAssets: 0 });
});

app.listen(PORT, () => {
  console.log(`Vault API running on port ${PORT}`);
}); 