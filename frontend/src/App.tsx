import React, { useEffect, useState } from "react";
import { WagmiConfig, createConfig, configureChains, sepolia } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { RainbowKitProvider, getDefaultWallets, ConnectButton } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css';

const { chains, publicClient } = configureChains(
  [sepolia],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "vS Token MVP",
  projectId: "vs-token-mvp",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function VaultDashboard() {
  const [vault, setVault] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVault() {
      setLoading(true);
      const vaults = await fetch("/vaults").then(r => r.json());
      if (vaults && vaults[0]) {
        const details = await fetch(`/vault/${vaults[0].address}`).then(r => r.json());
        setVault({ ...vaults[0], ...details });
      }
      setLoading(false);
    }
    fetchVault();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 12 }}>
      <h2>vS Vault Dashboard</h2>
      <ConnectButton />
      <div style={{ marginTop: 32 }}>
        {loading ? <p>Loading vault data...</p> : vault ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <strong>Vault Address:</strong> <span style={{ fontFamily: 'monospace' }}>{vault.address}</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Total Assets:</strong> {vault.totalAssets}
            </div>
            {/* TODO: Add deposit/withdraw UI here */}
          </>
        ) : <p>No vault found.</p>}
      </div>
    </div>
  );
}

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <VaultDashboard />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
