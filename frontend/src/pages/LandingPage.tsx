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
            <h1 className="hero-title">Turn Locked Tokens into Cash</h1>
            <p className="hero-subtitle">
              Deposit your locked fNFT. Get vS tokens worth the full amount. Sell them for cash today.
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
              <h3>Get Full Value Now</h3>
              <p>Put in your fNFT. Get tokens worth the full amount. No waiting, no penalties.</p>
            </div>
            <div className="feature-card">
              <h3>Market Sets Price</h3>
              <p>Sell vS tokens at whatever price buyers will pay. We don't control the price - the market does.</p>
            </div>
            <div className="feature-card">
              <h3>No Admin Control</h3>
              <p>No one can steal your money. No one can change the rules. No one controls the vault after we deploy it.</p>
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