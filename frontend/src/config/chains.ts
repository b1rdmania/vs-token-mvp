import { type Chain } from 'viem';

export const sonicTestnet = {
  id: 57054,
  name: 'Sonic Blaze Testnet',
  nativeCurrency: { name: 'Sonic', symbol: 'S', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.blaze.soniclabs.com'] },
    public: { http: ['https://rpc.blaze.soniclabs.com'] },
  },
  blockExplorers: {
    default: { name: 'SonicScan', url: 'https://testnet.sonicscan.org' },
  },
  testnet: true,
} as const satisfies Chain; 