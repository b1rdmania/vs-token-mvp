import { NFTDeposited as NFTDepositedEvent, NFTWithdrawn as NFTWithdrawnEvent, Redeemed as RedeemedEvent } from "../generated/Vault/Vault"
import { NFTDeposited, NFTWithdrawn, Redeemed } from "../generated/schema"

export function handleNFTDeposited(event: NFTDepositedEvent): void {
  let entity = new NFTDeposited(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.user = event.params.user
  entity.nftId = event.params.nftId
  entity.value = event.params.value
  entity.claimableValue = event.params.claimableValue
  entity.penalty = event.params.penalty
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
  entity.claimableValue = event.params.claimableValue
  entity.penalty = event.params.penalty
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleRedeemed(event: RedeemedEvent): void {
  let entity = new Redeemed(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.claimableValue = event.params.claimableValue
  entity.penalty = event.params.penalty
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
} 