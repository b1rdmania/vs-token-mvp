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
            Connect Wallet
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section - 50/50 split */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-grid">
              <div className="hero-content">
                <h1 className="hero-title">vS Vault — cash today, full S tomorrow</h1>
                <p className="hero-subtitle">
                  Swap your locked Sonic airdrop for liquid vS in one click.
                </p>
                <p className="hero-fees">
                  <strong>1% in, 2% out. Upgrades require multisig approval and a public timelock.</strong>
                </p>
                <Link to="/app" className="button-primary button-hero">
                  Connect Wallet
                </Link>
              </div>
              <div className="hero-visual">
                <div className="phone-mockup">
                  <img src="https://placehold.co/300x600/6366F1/FFFFFF?text=fNFT+%E2%86%92+vS+%E2%86%92+Cash" alt="Mobile app mockup" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - 4 compact cards */}
        <section className="how-it-works">
          <div className="container">
            <h2>How It Works</h2>
            <div className="process-grid">
              <div className="process-card">
                <div className="card-emoji">🏷️</div>
                <h3>Deposit fNFT</h3>
                <p>Move the NFT into the vault. Delegation comes with it.</p>
              </div>
              <div className="process-card">
                <div className="card-emoji">🪙</div>
                <h3>Mint vS (–1%)</h3>
                <p>1,000 S face → 990 vS in your wallet.</p>
              </div>
              <div className="process-card">
                <div className="card-emoji">🔄</div>
                <h3>Use it</h3>
                <p>Trade, LP or lend. Market decides the discount.</p>
              </div>
              <div className="process-card">
                <div className="card-emoji">🔓</div>
                <h3>Redeem 1:1 (–2%)</h3>
                <p>Month 9 we auto-claim every NFT → burn 990 vS, get ~970 S.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits - 6 cards */}
        <section className="benefits-section">
          <div className="container">
            <h2>Key Benefits</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <h3>✅ Immediate liquidity</h3>
                <p>Cash now instead of 9-month drip.</p>
              </div>
              <div className="benefit-card">
                <h3>✅ Fair time pricing</h3>
                <p>Discount is market-made, not protocol-forced.</p>
              </div>
              <div className="benefit-card">
                <h3>✅ Zero penalty burns</h3>
                <p>We wait for the 0% burn window so you don't eat it.</p>
              </div>
              <div className="benefit-card">
                <h3>✅ DeFi ready</h3>
                <p>Pure ERC-20 plugs into every Sonic pool.</p>
              </div>
              <div className="benefit-card">
                <h3>✅ No rug risk</h3>
                <p>Upgrades require multisig approval and a public timelock. No single admin.</p>
              </div>
              <div className="benefit-card">
                <h3>✅ 1:1 redemption</h3>
                <p>Every vS is backed by 1 S once harvest finishes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Economics Banner */}
        <section className="economics-banner">
          <div className="container">
            <div className="economics-content">
              <span><strong>Fees:</strong> 1% mint • 2% redeem</span>
              <span><strong>Total cost:</strong> ≈ 3% to unlock day-zero liquidity</span>
              <span><strong>Net to you:</strong> ~97% of original S value</span>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="faq-section">
          <div className="container">
            <h2>FAQ</h2>
            <div className="faq-accordion">
              <details open>
                <summary>Why is the redeem fee higher?</summary>
                <p>It funds the keeper gas and LP incentives at harvest.</p>
              </details>
              <details>
                <summary>What if a claim fails?</summary>
                <p>Failed NFTs are auto-retried; everyone else still redeems pro-rata.</p>
              </details>
              <details>
                <summary>Can fees ever change?</summary>
                <p>Any change requires multisig approval and a public timelock, so users always have time to react.</p>
              </details>
              <details>
                <summary>Which wallet gets the fees?</summary>
                <p>The public treasury. Address is pinned at deploy.</p>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta">
          <div className="container">
            <h2>Ready?</h2>
            <p>Connect wallet → deposit → mint vS.</p>
            <p className="cta-tagline"><em>Turn waiting into doing.</em></p>
            <Link to="/app" className="button-primary button-hero">
              Connect Wallet → Deposit fNFT
            </Link>
            <p className="risk-disclaimer">
              Risk: Market pricing means vS may trade below face value before maturity.
            </p>
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
          <p>&copy; 2025 vS Vault. Ready to turn waiting into doing.</p>
        </div>
      </footer>
    </div>
  );
}; 