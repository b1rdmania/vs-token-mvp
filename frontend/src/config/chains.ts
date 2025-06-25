import { type Chain } from 'viem';

export const sonicMainnet = {
  id: 146,
  name: 'Sonic Mainnet',
  nativeCurrency: { name: 'Sonic', symbol: 'S', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.soniclabs.com'] },
    public: { http: ['https://rpc.soniclabs.com'] },
  },
  blockExplorers: {
    default: { name: 'SonicScan', url: 'https://sonicscan.org' },
  },
  testnet: false,
} as const satisfies Chain;

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