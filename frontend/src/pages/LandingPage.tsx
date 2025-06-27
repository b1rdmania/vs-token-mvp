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

        <section className="explainer-section">
          <div className="container">
            <div className="explainer-header">
              <h2 className="explainer-title">🚀 vS Vault: Get Full Value Now, Pay Time Discount</h2>
              <p className="explainer-subtitle">The Simple Model</p>
            </div>
            
            <div className="process-grid">
              <div className="process-card">
                <div className="step-number">1</div>
                <h3>Deposit fNFT</h3>
                <p>Transfer your entire fNFT to the vault permanently</p>
              </div>
              <div className="process-card">
                <div className="step-number">2</div>
                <h3>Get Full Value vS</h3>
                <p>Receive vS tokens equal to fNFT's TOTAL value (1000 vS for 1000 S fNFT)</p>
              </div>
              <div className="process-card">
                <div className="step-number">3</div>
                <h3>Market Prices Time</h3>
                <p>vS trades at discount (0.25 S) reflecting time to maturity</p>
              </div>
              <div className="process-card">
                <div className="step-number">4</div>
                <h3>Prices Should Converge</h3>
                <p>As months pass, vS price should converge toward full S value</p>
              </div>
            </div>

            <div className="comparison-grid">
              <div className="comparison-card without">
                <h3>😔 Without vS Vault</h3>
                <ul>
                  <li>fNFT locked for 9 months</li>
                  <li>Can only claim 25% now</li>
                  <li>Must wait for full value</li>
                  <li>No immediate liquidity</li>
                </ul>
              </div>
              <div className="comparison-card with">
                <h3>🚀 With vS Vault</h3>
                <ul>
                  <li>Get full value vS tokens now</li>
                  <li>Trade at market discount (0.25x)</li>
                  <li>Prices should converge over time</li>
                  <li>Immediate DeFi liquidity</li>
                </ul>
              </div>
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
            <Link to="/app">
              Launch App
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} vS Vault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}; 