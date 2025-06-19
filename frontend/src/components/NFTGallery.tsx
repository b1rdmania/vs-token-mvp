import React from 'react';
import { useAccount } from 'wagmi';

interface NFTCard {
  id: number;
  image: string;
  claimableAmount: number;
  penaltyAmount: number;
  vestingProgress: number;
}

export const NFTGallery: React.FC = () => {
  const { address } = useAccount();

  // Mock data for MVP - replace with actual NFT data later
  const mockNFTs: NFTCard[] = [
    {
      id: 1,
      image: "https://placehold.co/300x300",
      claimableAmount: 50,
      penaltyAmount: 50,
      vestingProgress: 50
    },
    {
      id: 2,
      image: "https://placehold.co/300x300",
      claimableAmount: 75,
      penaltyAmount: 25,
      vestingProgress: 75
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your NFTs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockNFTs.map((nft) => (
          <div key={nft.id} className="bg-white rounded-lg shadow-md p-4">
            <img src={nft.image} alt={`NFT ${nft.id}`} className="w-full h-48 object-cover rounded-md mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">NFT #{nft.id}</h3>
              <div className="flex justify-between">
                <span>Claimable:</span>
                <span>{nft.claimableAmount} S</span>
              </div>
              <div className="flex justify-between">
                <span>Penalty:</span>
                <span>{nft.penaltyAmount}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${nft.vestingProgress}%` }}
                ></div>
              </div>
              <div className="flex space-x-2 mt-4">
                <button 
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  onClick={() => console.log('Deposit NFT', nft.id)}
                >
                  Deposit
                </button>
                <button 
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  onClick={() => console.log('Withdraw NFT', nft.id)}
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 