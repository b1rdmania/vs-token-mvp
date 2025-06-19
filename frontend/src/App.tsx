import React from "react";
import { createConfig, WagmiConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { http } from "wagmi/transport";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';
import { Dashboard } from "./components/Dashboard";

const { wallets } = getDefaultWallets({
  appName: "vS Token MVP",
  projectId: "vs-token-mvp",
  chains: [sepolia],
});

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});

function App() {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={[sepolia]}>
        <Dashboard />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
