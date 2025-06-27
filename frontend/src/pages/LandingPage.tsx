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
            <h1 className="hero-title">Get Full Value Now from Your Locked fNFTs</h1>
            <p className="hero-subtitle">
              Deposit your vesting fNFT and receive full-value vS tokens immediately. Trade them in the Shadow DEX pool for instant liquidity while your fNFT continues vesting in the vault.
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
              <h3>Instant Full Value</h3>
              <p>Deposit your fNFT once and receive vS tokens equal to its total value immediately. No complex tracking - just simple, full-value liquidity you can use right away.</p>
            </div>
            <div className="feature-card">
              <h3>Market-Driven Pricing</h3>
              <p>Trade your vS tokens in the Shadow DEX pool at market rates. Price naturally appreciates as your fNFT approaches full vesting, reflecting time value.</p>
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
            <span style={{ margin: '0 8px' }}>|</span>
            <Link to="/TestnetDemo">
              Demo
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} vS Vault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}; 