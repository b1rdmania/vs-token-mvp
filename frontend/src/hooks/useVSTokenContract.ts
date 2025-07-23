import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContracts } from '../config/contracts';
import { useAccount, useChainId } from 'wagmi';
import VSTokenABI from '../abis/ImmutableVSToken.json';

export const useVSTokenContract = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  // Read token balance
  const { data: balance, isLoading: isLoadingBalance } = useReadContract({
    address: contracts.VS_TOKEN_PROXY as `0x${string}`,
    abi: VSTokenABI,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  // Read token info
  const { data: tokenInfo, isLoading: isLoadingTokenInfo } = useReadContract({
    address: contracts.VS_TOKEN_PROXY as `0x${string}`,
    abi: VSTokenABI,
    functionName: 'getTokenInfo',
  });

  // Read total supply
  const { data: totalSupply, isLoading: isLoadingTotalSupply } = useReadContract({
    address: contracts.VS_TOKEN_PROXY as `0x${string}`,
    abi: VSTokenABI,
    functionName: 'totalSupply',
  });

  // Approve function (for trading)
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

  const handleApprove = (spender: string, amount: bigint) => {
    approve({
      address: contracts.VS_TOKEN_PROXY as `0x${string}`,
      abi: VSTokenABI,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return {
    // State
    balance,
    tokenInfo,
    totalSupply,
    isLoadingBalance,
    isLoadingTokenInfo,
    isLoadingTotalSupply,
    
    // Actions
    approve: handleApprove,
    isApproving,
    isApproveConfirming,
    
    // Errors
    approveError,
    
    // Contract address
    tokenAddress: contracts.VS_TOKEN_PROXY,
  };
};
