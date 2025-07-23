import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContracts } from '../config/contracts';
import { useAccount, useChainId } from 'wagmi';
import VaultABI from '../abis/ImmutableVault.json';

export const useVaultContract = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  // Read if vault is frozen
  const { data: isVaultFrozen, isLoading: isLoadingVaultFrozen } = useReadContract({
    address: contracts.VAULT_PROXY as `0x${string}`,
    abi: VaultABI,
    functionName: 'isVaultFrozen',
  });

  // Read backing ratio
  const { data: backingRatio, isLoading: isLoadingBackingRatio } = useReadContract({
    address: contracts.VAULT_PROXY as `0x${string}`,
    abi: VaultABI,
    functionName: 'getBackingRatio',
  });

  // Read total assets
  const { data: totalAssets, isLoading: isLoadingTotalAssets } = useReadContract({
    address: contracts.VAULT_PROXY as `0x${string}`,
    abi: VaultABI,
    functionName: 'totalAssets',
  });

  // Deposit function (no args)
  const { 
    data: depositHash, 
    writeContract: deposit, 
    isPending: isDepositing,
    error: depositError 
  } = useWriteContract();

  // Redeem function
  const { 
    data: redeemHash, 
    writeContract: redeem, 
    isPending: isRedeeming,
    error: redeemError 
  } = useWriteContract();

  // Wait for deposit transaction
  const { isLoading: isDepositConfirming } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Wait for redeem transaction
  const { isLoading: isRedeemConfirming } = useWaitForTransactionReceipt({
    hash: redeemHash,
  });

  const handleDeposit = () => {
    deposit({
      address: contracts.VAULT_PROXY as `0x${string}`,
      abi: VaultABI,
      functionName: 'deposit',
    });
  };

  const handleRedeem = (amount: bigint) => {
    redeem({
      address: contracts.VAULT_PROXY as `0x${string}`,
      abi: VaultABI,
      functionName: 'redeem',
      args: [amount],
    });
  };

  return {
    // State
    isVaultFrozen,
    backingRatio,
    totalAssets,
    isLoadingVaultFrozen,
    isLoadingBackingRatio,
    isLoadingTotalAssets,
    
    // Actions
    deposit: handleDeposit,
    redeem: handleRedeem,
    isDepositing,
    isRedeeming,
    isDepositConfirming,
    isRedeemConfirming,
    
    // Errors
    depositError,
    redeemError,
    
    // Contract address
    vaultAddress: contracts.VAULT_PROXY,
  };
};
