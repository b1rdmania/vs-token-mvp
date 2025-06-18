import React from "react";
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
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 12 }}>
      <h2>vS Vault Dashboard</h2>
      <ConnectButton />
      <div style={{ marginTop: 32 }}>
        <p>Vault stats and actions will appear here.</p>
        {/* TODO: Integrate backend and The Graph for live data */}
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
