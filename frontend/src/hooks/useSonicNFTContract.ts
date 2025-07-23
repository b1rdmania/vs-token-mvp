import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContracts } from '../config/contracts';
import { useAccount, useChainId } from 'wagmi';
import SonicNFTABI from '../abis/SonicFNft.json';

export interface NFTInfo {
  id: number;
  balance: bigint;
  vested?: bigint;
  penalty?: bigint;
}

export interface SeasonData {
  startTime: number;
  maturationTime: number;
  claimsBurnTime: number;
  lockedBurnTime: number;
  instantClaimAvailableBps: number;
  merkleRoot: string;
}

export const useSonicNFTContract = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  // Read balance for Season 1
  const { data: season1Balance } = useReadContract({
    address: contracts.SONIC_NFT as `0x${string}`,
    abi: SonicNFTABI,
    functionName: 'balanceOf',
    args: [address, 1n],
    query: {
      enabled: !!address && !!contracts.SONIC_NFT,
    },
  });

  // Get season balances (balance, vested, penalty) for Season 1
  const { data: season1Balances } = useReadContract({
    address: contracts.SONIC_NFT as `0x${string}`,
    abi: SonicNFTABI,
    functionName: 'getSeasonBalances',
    args: [1, address], // Season 1, user address
    query: {
      enabled: !!address && !!contracts.SONIC_NFT,
    },
  });

  // Get season data for Season 1
  const { data: season1Data } = useReadContract({
    address: contracts.SONIC_NFT as `0x${string}`,
    abi: SonicNFTABI,
    functionName: 'getSeasonData',
    args: [1], // Season 1
    query: {
      enabled: !!contracts.SONIC_NFT,
    },
  });

  // Check approval for vault
  const { data: isApprovedForVault, isLoading: isLoadingApproval } = useReadContract({
    address: contracts.SONIC_NFT as `0x${string}`,
    abi: SonicNFTABI,
    functionName: 'isApprovedForAll',
    args: [address, contracts.VAULT_PROXY],
    query: {
      enabled: !!address && !!contracts.SONIC_NFT && !!contracts.VAULT_PROXY,
    },
  });

  // Approve vault to transfer NFTs
  const { 
    data: approveHash, 
    writeContract: approve, 
    isPending: isApproving,
    error: approveError 
  } = useWriteContract();

  // Wait for approve transaction
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const handleApproveVault = () => {
    if (!contracts.SONIC_NFT || !contracts.VAULT_PROXY) return;
    approve({
      address: contracts.SONIC_NFT as `0x${string}`,
      abi: SonicNFTABI,
      functionName: 'setApprovalForAll',
      args: [contracts.VAULT_PROXY, true],
    });
  };

  // Transform NFT data for UI - only include seasons with balances
  const transformedNFTs: NFTInfo[] = [];
  if (typeof season1Balance === 'bigint' && season1Balance > 0n) {
    const balances = season1Balances as [bigint, bigint, bigint] | undefined;
    transformedNFTs.push({ 
      id: 1, 
      balance: season1Balance,
      vested: balances?.[1],
      penalty: balances?.[2]
    });
  }
  // Add more seasons as needed

  return {
    userNFTs: transformedNFTs,
    isLoadingUserNFTs: false,
    isApprovedForVault,
    approveVault: handleApproveVault,
    isApproving,
    isApproveConfirming,
    approveError,
    season1Data, // Expose season data for UI
  };
};
