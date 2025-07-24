import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { sonicMainnet, sonicTestnet } from './config/chains';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { WhitepaperPage } from './pages/WhitepaperPage';
import { Toaster } from 'react-hot-toast';

import '@rainbow-me/rainbowkit/styles.css';

const projectId = import.meta.env.VITE_PROJECT_ID;

if (!projectId) {
  throw new Error("VITE_PROJECT_ID is not set. Please add it to your .env file or Vercel project settings.");
}

const config = createConfig({
  chains: [ sonicMainnet],
  // chains: [sonicTestnet, sonicMainnet],
  // [sonicTestnet.id]: http(),
  transports: {
    [sonicMainnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/whitepaper" element={<WhitepaperPage />} />
                <Route path="/app/*" element={<AppShell />} />

              </Routes>
            </Router>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default App;
