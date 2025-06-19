import React from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NFTGallery } from './NFTGallery';
import { PenaltyCurveChart } from './PenaltyCurveChart';

export const Dashboard: React.FC = () => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-bold mb-8">vS Token Vault</h1>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">vS Token Vault</h1>
            </div>
            <div className="flex items-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Vesting Schedule</h2>
              <PenaltyCurveChart />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Value Locked</p>
                  <p className="text-2xl font-bold">100 S</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Claimable Value</p>
                  <p className="text-2xl font-bold">50 S</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Current Penalty</p>
                  <p className="text-2xl font-bold">50%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">NFTs Deposited</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <NFTGallery />
          </div>
        </div>
      </main>
    </div>
  );
}; 