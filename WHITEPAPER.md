# vS Vault: Technical Whitepaper
*Version 1.0*

## 1. Abstract

The vS Vault protocol is a decentralized application designed to unlock liquidity from vesting-wrapped NFTs, specifically focusing on the upcoming Sonic (S) token airdrop. The Sonic Airdrop is distributed inside time-locked NFTs to facilitate a gradual release into the market. While this promotes network stability, it locks up significant capital for individual holders. vS Vault solves this by allowing users to deposit their vesting NFTs into a secure, non-custodial smart contract and mint `vS` tokens—a liquid ERC20 token that represents a claim on the underlying, vested portion of their deposit. This provides users with instant liquidity, enabling them to trade or participate in other DeFi activities while their original assets continue to vest as intended.

## 2. Core Concepts

### 2.1. Vesting NFTs (fNFTs)

Vesting NFTs are non-fungible tokens that represent ownership of a principal amount of underlying assets (e.g., Sonic 'S' tokens) that unlock over a predefined period. These NFTs are non-transferable containers of future value. The core asset of the vS Vault protocol is interacting with these NFTs once they are deployed by the Sonic Foundation.

### 2.2. vS Token

The `vS` token is a standard ERC20 token that is minted by the vS Vault. It is a "stable-asset" backed 1:1 by the vested, claimable 'S' tokens held within the vault. The total supply of `vS` is dynamically controlled by the amount of vested 'S' tokens locked in the protocol, ensuring it is always fully backed.

### 2.3. The Vault Contract

The Vault is the core smart contract of the protocol. It is responsible for:
-   Accepting deposits of vesting NFTs.
-   Calculating the currently vested and claimable portion of the underlying 'S' tokens for each deposited NFT.
-   Minting `vS` tokens to the depositor based on this vested value.
-   Allowing users to redeem `vS` tokens for the underlying 'S' tokens.
-   Managing the withdrawal of the original NFT once it has fully vested.

## 3. Technical Architecture

The vS Vault is a fully on-chain protocol built on the Sonic blockchain, comprised of smart contracts and a decentralized frontend.

### 3.1. Smart Contracts

-   **`Vault.sol`**: The primary contract managing all deposits, minting, and logic. It will be initialized with the address of the official Sonic NFT contract upon mainnet deployment.
-   **`vSToken.sol`**: The ERC20 contract for the `vS` token. It grants minting rights exclusively to the `Vault.sol` contract.
-   **`MockSonicNFT.sol` (for MVP)**: A mock ERC721 contract that simulates the behavior of the official vesting NFTs for testnet development. It includes functions to define a vesting schedule (start date, duration, total amount) for each minted NFT.

### 3.2. Frontend

The frontend is a modern, responsive React application built with Vite.
-   **Wallet Integration**: Utilizes `wagmi` and `RainbowKit` for seamless wallet connection.
-   **Component Structure**: Key pages include a landing page, a deposit interface, a user dashboard to track vested/minted amounts, a trading page (future integration), and a liquidity pool page.
-   **On-Chain Interaction**: The frontend communicates directly with the Sonic blockchain; no centralized backend is required for core protocol functions.

## 4. MVP Roadmap: Testnet to Mainnet

### Step 1: MVP Build & Testnet Deployment (Current Phase)

1.  **Develop `MockSonicNFT.sol`**: Create an ERC721 contract with a linear vesting function to simulate the upcoming Sonic NFTs.
2.  **Deploy to Sonic Testnet**: Deploy the `Vault`, `vSToken`, and `MockSonicNFT` contracts.
3.  **Mint Mock NFTs**: Distribute mock NFTs to test wallets.
4.  **Frontend Integration**: Connect the dApp to the testnet contracts, enabling users to:
    -   View their mock NFTs.
    -   Deposit a mock NFT into the Vault.
    -   See their vested progress on the dashboard.
    -   Mint `vS` tokens against their vested balance.
5.  **Test 1-Click Zap**: Implement the UI and mock integration for a "1-Click Zap" into a vS/S liquidity pool, in partnership with a DEX like Shadow.

### Step 2: Pre-Launch (Mainnet Preparation)

1.  **Security Audit**: Conduct a comprehensive, third-party security audit of all smart contracts (`Vault.sol`, `vSToken.sol`) to ensure user funds are secure.
2.  **Official Integration**: Update the `Vault.sol` contract to replace the mock NFT address with the official Sonic Vesting NFT contract address.
3.  **Frontend Polish**: Refine the user interface and experience based on feedback from testnet users.

### Step 3: Mainnet Launch

1.  **Deploy Contracts**: Deploy the audited and finalized smart contracts to the Sonic mainnet.
2.  **Launch Frontend**: Push the final version of the frontend live.
3.  **Liquidity Pool Seeding**: Work with our DEX partner (e.g., Shadow) to create the official vS/S liquidity pool.
4.  **Launch Incentives**: Roll out liquidity mining programs and "boosted APR" models to encourage user participation and deepen liquidity.

## 5. Conclusion

The vS Vault protocol is poised to become a critical piece of infrastructure within the Sonic ecosystem. By providing day-one liquidity for airdrop recipients, it enhances capital efficiency and provides immediate utility for locked assets. The project's commitment to security, decentralization, and a seamless user experience will make it an indispensable tool for the Sonic community. 