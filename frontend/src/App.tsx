import React, { useEffect, useState } from "react";
import { WagmiConfig, createConfig, configureChains, sepolia, useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { RainbowKitProvider, getDefaultWallets, ConnectButton } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css';
import vaultAbi from "./Vault.json";

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
  const [nftId, setNftId] = useState("");
  const [action, setAction] = useState<"deposit"|"withdraw"|null>(null);
  const [txHash, setTxHash] = useState<string|null>(null);
  const { address, isConnected } = useAccount();

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

  // Prepare contract write
  const { config: depositConfig } = usePrepareContractWrite({
    address: vault?.address,
    abi: vaultAbi as any,
    functionName: "depositNFT",
    args: [nftId ? BigInt(nftId) : undefined],
    enabled: isConnected && !!vault?.address && !!nftId && action === "deposit",
  });
  const { config: withdrawConfig } = usePrepareContractWrite({
    address: vault?.address,
    abi: vaultAbi as any,
    functionName: "withdrawNFT",
    args: [nftId ? BigInt(nftId) : undefined],
    enabled: isConnected && !!vault?.address && !!nftId && action === "withdraw",
  });
  const { write: depositWrite, data: depositData, isLoading: isDepositing } = useContractWrite(depositConfig);
  const { write: withdrawWrite, data: withdrawData, isLoading: isWithdrawing } = useContractWrite(withdrawConfig);

  // Wait for tx
  const { isLoading: txPending, isSuccess: txSuccess } = useWaitForTransaction({
    hash: txHash,
    enabled: !!txHash,
    onSuccess: () => {
      setTxHash(null);
      setAction(null);
      setNftId("");
      // Optionally, refetch vault stats
    }
  });

  const handleDeposit = () => {
    setAction("deposit");
    depositWrite?.();
    if (depositData?.hash) setTxHash(depositData.hash);
  };
  const handleWithdraw = () => {
    setAction("withdraw");
    withdrawWrite?.();
    if (withdrawData?.hash) setTxHash(withdrawData.hash);
  };

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
            <div style={{ margin: '24px 0' }}>
              <input
                type="number"
                placeholder="NFT ID"
                value={nftId}
                onChange={e => setNftId(e.target.value)}
                style={{ width: 120, marginRight: 12 }}
                disabled={isDepositing || isWithdrawing || txPending}
              />
              <button onClick={handleDeposit} disabled={!isConnected || !nftId || isDepositing || txPending}>
                Deposit NFT
              </button>
              <button onClick={handleWithdraw} disabled={!isConnected || !nftId || isWithdrawing || txPending} style={{ marginLeft: 8 }}>
                Withdraw NFT
              </button>
            </div>
            {txPending && <p>Transaction pending...</p>}
            {txSuccess && <p>Transaction confirmed!</p>}
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
