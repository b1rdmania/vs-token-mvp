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
            <h1 className="hero-title">Immediate Liquidity for Locked Tokens</h1>
            <p className="hero-subtitle">
              Deposit your fNFT, get vS tokens immediately, trade for cash today. 1:1 redemption available April 2026.
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
              <img src="https://placehold.co/800x200/F7F9FC/0D111C?text=fNFT+%E2%86%92+Vault+%E2%86%92+vS+%E2%86%92+Cash" alt="vS Token Protocol Flow" />
            </div>
          </div>
        </section>

        <section className="explainer-section">
          <div className="container">
            <div className="explainer-header">
              <h2 className="explainer-title">How It Works</h2>
              <p className="explainer-subtitle">1. Deposit fNFT → 2. Get vS tokens → 3. Trade instantly → 4. Redeem 1:1 at maturity</p>
            </div>
            
            <div className="process-grid">
              <div className="process-card">
                <div className="step-number">1</div>
                <h3>Deposit Your fNFT</h3>
                <p>Transfer your vesting NFT to the vault permanently. Get full value immediately.</p>
              </div>
              <div className="process-card">
                <div className="step-number">2</div>
                <h3>Receive vS Tokens</h3>
                <p>Vault mints 99% of face value as vS tokens (1% mint fee). Example: 1,000 S locked → 990 vS in your wallet</p>
              </div>
              <div className="process-card">
                <div className="step-number">3</div>
                <h3>Trade Immediately</h3>
                <p>Swap vS for cash on Shadow DEX. Market determines price based on time to maturity.</p>
              </div>
              <div className="process-card">
                <div className="step-number">4</div>
                <h3>April 2026: Global Harvest</h3>
                <p>Vault claims all fNFTs at 0% penalty burn. Perfect 1:1 backing achieved.</p>
              </div>
            </div>

            <div className="features-section">
              <h3>Key Benefits</h3>
              <div className="features-grid">
                <div className="feature-card">
                  <h4>✅ Immediate Liquidity</h4>
                  <p>Cash today, not 9 months from now</p>
                </div>
                <div className="feature-card">
                  <h4>✅ Fair Pricing</h4>
                  <p>Market sets rates, no artificial pegs</p>
                </div>
                <div className="feature-card">
                  <h4>✅ Zero Penalty Burns</h4>
                  <p>Vault waits until maturity</p>
                </div>
                <div className="feature-card">
                  <h4>✅ DeFi Ready</h4>
                  <p>Standard ERC-20, works everywhere</p>
                </div>
                <div className="feature-card">
                  <h4>✅ No Rug Risk</h4>
                  <p>Immutable contracts, no admin keys</p>
                </div>
                <div className="feature-card">
                  <h4>✅ 1:1 Redemption</h4>
                  <p>Guaranteed after April 2026 (minus 2% fee)</p>
                </div>
              </div>
            </div>

            <div className="economics-section">
              <h3>Economics</h3>
              <div className="economics-table">
                <div className="economics-row">
                  <span>Mint Fee:</span>
                  <span>1% (when depositing fNFT)</span>
                </div>
                <div className="economics-row">
                  <span>Redeem Fee:</span>
                  <span>2% (when redeeming vS for S)</span>
                </div>
                <div className="economics-row">
                  <span>Total Cost:</span>
                  <span>~3% for immediate liquidity vs. 9-month wait</span>
                </div>
                <div className="economics-row">
                  <span>Net Efficiency:</span>
                  <span>97% of original fNFT value</span>
                </div>
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
          <p>&copy; {new Date().getFullYear()} vS Vault. Ready to turn waiting into doing.</p>
        </div>
      </footer>
    </div>
  );
}; 