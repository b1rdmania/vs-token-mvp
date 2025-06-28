/**
 * @title LandingPage - vS Vault Protocol Marketing Site
 * @author vS Vault Team
 * @description Main landing page for the vS Vault protocol - converts visitors to users
 * 
 * @overview
 * This component presents the vS Vault value proposition in ELI-15 simple language:
 * "Turn your locked Sonic airdrop into liquid vS tokens that trade immediately"
 * 
 * @sections
 * 1. Hero: Core value prop + CTA buttons (Launch App, GitHub, Whitepaper)
 * 2. Mini Flow: 60-second explanation of deposit → mint → trade → redeem
 * 3. Benefits Grid: 6 key advantages in 2x3 mobile-first layout  
 * 4. Economics Banner: Fee structure (1% mint, 2% redeem, ~3% total cost)
 * 5. Why Sonic: Ecosystem benefits (TVL growth, spread selling, user retention)
 * 6. FAQ: 3 focused questions with technical accuracy
 * 7. Final CTA: "Ready?" section with primary action button
 * 
 * @design_principles
 * - Mobile-first responsive grid layout
 * - Hemingway-simple copy (max 80 characters per line)
 * - ELI-15 tone while maintaining technical accuracy
 * - Consistent blue button styling for primary actions
 * - Light card shadows for visual hierarchy
 * 
 * @target_audience
 * - Sonic airdrop recipients with locked vesting NFTs
 * - DeFi users looking for immediate liquidity solutions
 * - Developers interested in immutable protocol design
 * - Community members evaluating trustless alternatives
 */

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
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-grid">
              <div className="hero-content">
                <h1 className="hero-title">vS Vault — cash today, full S tomorrow</h1>
                <p className="hero-subtitle">
                  Turn your vesting NFT into liquid vS in one click. 1% in, 2% out. No rugs.
                </p>
                <div className="hero-buttons">
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
              </div>
              <div className="hero-visual">
                <div className="phone-mockup">
                  <img src="https://placehold.co/300x600/6366F1/FFFFFF?text=fNFT+%E2%86%92+vS+%E2%86%92+Cash" alt="Mobile app mockup" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mini Flow Banner */}
        <section className="mini-flow-banner">
          <div className="container">
            <h2>How it works — 60s</h2>
            <p>① Deposit fNFT → ② Mint vS (-1%) → ③ Trade / LP → ④ Month 9: vault harvest → ⑤ Redeem 1:1 (-2%)</p>
          </div>
        </section>

        {/* Key Benefits - 2x3 grid */}
        <section className="benefits-section">
          <div className="container">
            <h2>Key Benefits</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <h3>✅ Immediate Liquidity</h3>
                <p>Unlock full face value on day 0.</p>
              </div>
              <div className="benefit-card">
                <h3>✅ Fair Discount</h3>
                <p>Market sets the time price, not us.</p>
              </div>
              <div className="benefit-card">
                <h3>✅ Zero Penalty Burns</h3>
                <p>Vault waits for 0% burn window.</p>
              </div>
              <div className="benefit-card">
                <h3>✅ DeFi Ready</h3>
                <p>Pure ERC-20 plugs into any Sonic pool.</p>
              </div>
              <div className="benefit-card">
                <h3>✅ No Rug Risk</h3>
                <p>Immutable code, no admin keys.</p>
              </div>
              <div className="benefit-card">
                <h3>✅ 1:1 Redemption</h3>
                <p>Every vS is backed by S after harvest.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Economics Banner */}
        <section className="economics-banner">
          <div className="container">
            <div className="economics-content">
              <span><strong>Fees:</strong> 1% mint • 2% redeem</span>
              <span><strong>Total cost:</strong> ~3% to skip a 9-month wait</span>
              <span><strong>Net to you:</strong> ~97% of original S</span>
            </div>
          </div>
        </section>

        {/* Why Sonic Section */}
        <section className="why-sonic-section">
          <div className="container">
            <h2>Why this is good for Sonic</h2>
            <ul>
              <li>• Locked airdrop value turns into TVL and swap fees.</li>
              <li>• Sell pressure spreads out instead of day-one dumping.</li>
              <li>• Users stick around to farm, lend and LP — growing the ecosystem.</li>
            </ul>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="faq-section">
          <div className="container">
            <h2>FAQ</h2>
            <div className="faq-accordion">
              <details open>
                <summary>Is the 1:1 real?</summary>
                <p>Yes. Vault claims every S at 0% burn; redeem burns vS and releases S.</p>
              </details>
              <details>
                <summary>Can the fees change?</summary>
                <p>No. 1% in, 2% out are hard-coded in an upgrade-blocked contract.</p>
              </details>
              <details>
                <summary>What if a claim fails?</summary>
                <p>The harvest retries in 20-NFT batches until every token is collected. Redeems stay pro-rata meanwhile.</p>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta">
          <div className="container">
            <h2>Ready?</h2>
            <p>Connect wallet → deposit fNFT → mint vS.</p>
            <p className="cta-tagline"><em>Turn waiting into doing.</em></p>
            <Link to="/app" className="button-primary button-hero">
              Launch App
            </Link>
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
