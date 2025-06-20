import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="container header-content">
          <div className="logo">vS Vault</div>
          <Link to="/app" className="button-primary">
            Launch App
          </Link>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="container">
            <h1 className="hero-title">Unlock Your Vesting Airdrop Rewards</h1>
            <p className="hero-subtitle">
              Deposit your vesting fNFT once, and as it vests, return to mint more vS tokens against its growing value. Unlock instant liquidity, trade, and participate in DeFi—all while your original rewards are securely locked.
            </p>
            <div className="hero-cta">
              <Link to="/app" className="button-primary button-hero">
                Launch App
              </Link>
              <a href="https://github.com/b1rdmania/vs-token-mvp" target="_blank" rel="noopener noreferrer" className="button-secondary button-hero">
                GitHub
              </a>
              <Link to="/whitepaper" className="button-secondary button-hero">
                White Paper
              </Link>
            </div>
            <div className="hero-visual">
              <img src="https://placehold.co/800x200/F7F9FC/0D111C?text=fNFT+%E2%86%92+Vault+%E2%86%92+vS+%E2%86%92+DeFi" alt="vS Token Protocol Flow" />
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <div className="feature-card">
              <h3>Continuous Liquidity</h3>
              <p>Deposit your fNFT once. As it vests over time, its claimable value grows—return to the dashboard at any time to mint more vS tokens against the same deposit.</p>
            </div>
            <div className="feature-card">
              <h3>Yield While You Wait</h3>
              <p>Don't just hold—participate. Use your liquid vS tokens in the broader DeFi ecosystem. Provide liquidity to a vS/S pool to earn trading fees and boosted rewards.</p>
            </div>
            <div className="feature-card">
              <h3>Zero Trust, Fully On-Chain</h3>
              <p>Your assets are secured in a non-custodial smart contract vault. All logic is transparent, on-chain, and built on open-source, audited principles.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-links">
            <a href="https://github.com/b1rdmania/vs-token-mvp" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} vS Vault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}; 