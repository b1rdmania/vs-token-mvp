import { NFTDeposited as NFTDepositedEvent, NFTWithdrawn as NFTWithdrawnEvent } from "../generated/Vault/Vault"
import { NFTDeposited, NFTWithdrawn } from "../generated/schema"

export function handleNFTDeposited(event: NFTDepositedEvent): void {
  let entity = new NFTDeposited(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.user = event.params.user
  entity.nftId = event.params.nftId
  entity.value = event.params.value
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleNFTWithdrawn(event: NFTWithdrawnEvent): void {
  let entity = new NFTWithdrawn(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.user = event.params.user
  entity.nftId = event.params.nftId
  entity.value = event.params.value
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
} 