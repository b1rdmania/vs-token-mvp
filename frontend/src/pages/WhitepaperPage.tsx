import React from 'react';
import { Link } from 'react-router-dom';
import './WhitepaperPage.css';

export const WhitepaperPage: React.FC = () => {
  return (
    <div className="whitepaper-page">
      <header className="landing-header">
        <div className="container header-content">
          <Link to="/" className="logo">vS Vault</Link>
          <Link to="/app" className="button-primary">
            Launch App
          </Link>
        </div>
      </header>
      <main className="container">
        <div className="content-card">
          <h1>vS Vault: Technical Whitepaper</h1>
          <p className="version">Version 1.0</p>

          <section>
            <h2>1. Abstract</h2>
            <p>The vS Vault protocol is a decentralized application designed to unlock liquidity from vesting-wrapped NFTs, specifically focusing on the upcoming Sonic (S) token airdrop. Airdropped tokens are often distributed inside time-locked NFTs to facilitate a gradual release into the market. While this promotes network stability, it locks up significant capital for individual holders. vS Vault solves this by allowing users to deposit their vesting NFTs into a secure, non-custodial smart contract and mint <code>vS</code> tokens—a liquid ERC20 token that represents a claim on the underlying, vested portion of their deposit. This provides users with instant liquidity, enabling them to trade or participate in other DeFi activities while their original assets continue to vest as intended.</p>
          </section>

          <section>
            <h2>2. Core Concepts</h2>
            {/* ... Content from Markdown ... */}
          </section>
          
          <section>
            <h2>3. Technical Architecture</h2>
            <h3>3.1. Smart Contracts</h3>
            <ul>
              <li><strong><a href="https://github.com/b1rdmania/vs-token-mvp/blob/main/src/vSVault.sol" target="_blank" rel="noopener noreferrer">vSVault.sol</a></strong>: The primary contract managing all deposits, minting, and logic.</li>
              <li><strong><a href="https://github.com/b1rdmania/vs-token-mvp/blob/main/src/vSToken.sol" target="_blank" rel="noopener noreferrer">vSToken.sol</a></strong>: The ERC20 contract for the <code>vS</code> token.</li>
              <li><strong><a href="https://github.com/b1rdmania/vs-token-mvp/blob/main/test/MockSonicNFT.sol" target="_blank" rel="noopener noreferrer">MockSonicNFT.sol</a> (for MVP)</strong>: A mock ERC721 contract that simulates the behavior of the official vesting NFTs.</li>
            </ul>
            {/* ... rest of content ... */}
          </section>
          
          <section>
            <h2>4. MVP Roadmap: Testnet to Mainnet</h2>
            {/* ... Content from Markdown ... */}
          </section>

          <section>
            <h2>5. Next Steps: How to Run the MVP</h2>
            <p>To get the MVP running locally and interact with it on a testnet, follow these steps:</p>
            <ol>
              <li><strong>Set Up Environment:</strong> Ensure you have Foundry installed. Create a <code>.env</code> file in the root directory and add your <code>PRIVATE_KEY</code> and a testnet <code>RPC_URL</code>.</li>
              <li>
                <strong>Deploy Contracts:</strong> Run the deployment script using Foundry.
                <pre><code>forge script script/Deploy_vSVault.s.sol --rpc-url $RPC_URL --broadcast</code></pre>
              </li>
              <li><strong>Update Frontend:</strong> Copy the new contract addresses into your frontend configuration.</li>
              <li><strong>Run Frontend:</strong> Navigate to the <code>/frontend</code> directory, run <code>npm install</code>, and then <code>npm run dev</code>.</li>
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}; 