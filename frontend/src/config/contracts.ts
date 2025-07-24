// Contract addresses for different networks
export const CONTRACTS = {
  // Sonic Testnet (Chain ID: 57054)
  57054: {
    VAULT_PROXY: "0x918bf1aa3bcdab85b348b9d5e10c3ed08d008abe",
    VS_TOKEN_PROXY: "0x82d7cdc44e488674668ec738c8c6967c4c7124e5",
    SONIC_NFT: "0x399b835Ae853b514C5Ac6781AC6cF6355EAc538B",
  },
  146: {
    VAULT_PROXY: "0xE2BB365a107441C1734a7aC08930dbEbb421249d", 
    VS_TOKEN_PROXY: "0x2286bA4fcbb2eF06C4349fAF6B8970ece593f5DD", 
    SONIC_NFT: "0xE1401171219FD2fD37c8C04a8A753B07706F3567",
  }
} as const;

// Helper function to get contracts for current chain
export const getContracts = (chainId: number) => {
  return CONTRACTS[chainId as keyof typeof CONTRACTS] || CONTRACTS[57054]; // Default to testnet
};

// Network configuration
export const NETWORKS = {
  TESTNET: {
    chainId: 57054,
    name: "Sonic Testnet",
    rpcUrl: "https://rpc.blaze.soniclabs.com",
    explorer: "https://testnet.soniclabs.com",
  },
  MAINNET: {
    chainId: 146,
    name: "Sonic Mainnet", 
    rpcUrl: "https://rpc.soniclabs.com",
    explorer: "https://soniclabs.com",
  }
} as const; 