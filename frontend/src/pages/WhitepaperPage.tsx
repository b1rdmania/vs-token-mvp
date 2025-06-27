import React from 'react';
import { Link } from 'react-router-dom';
import './WhitepaperPage.css';

export const WhitepaperPage: React.FC = () => {
  return (
    <div className="whitepaper-page">
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
            <h1 className="hero-title">vS Vault Whitepaper v2.0</h1>
            <p className="hero-subtitle">
              Turn locked fNFTs into immediate liquidity
            </p>
          </div>
        </section>

        <section className="content-section">
          <div className="container">
            <div className="content-card">
              
              <div className="section">
                <h2>The Problem</h2>
                <p>
                  Sonic users received vesting NFTs (fNFTs) containing S tokens locked for 9 months. These fNFTs represent real value but can't be:
                </p>
                <ul>
                  <li>Spent for immediate needs</li>
                  <li>Used in DeFi protocols</li>
                  <li>Traded without penalty burns</li>
                </ul>
                <p>This locks millions in value that could be productive today.</p>
              </div>

              <div className="section">
                <h2>The Solution: Wait-and-Claim Strategy</h2>
                <p>vS Vault provides immediate liquidity while preserving full backing:</p>
                
                <div className="subsection">
                  <h3>Core Mechanism</h3>
                  <ol>
                    <li><strong>Deposit:</strong> User deposits fNFT (1000 S total) → Vault mints 1000 vS immediately</li>
                    <li><strong>Trade:</strong> User trades vS on Shadow DEX at market rates for instant liquidity</li>
                    <li><strong>Vault Waits:</strong> Vault holds all fNFTs until month 9 (no early claiming = no penalty burns)</li>
                    <li><strong>Global Maturity:</strong> At month 9, vault claims 100% of all S tokens (0% penalty burn)</li>
                    <li><strong>Redeem:</strong> Users can redeem vS → S at exactly 1:1 ratio on our site</li>
                  </ol>
                </div>

                <div className="highlight-box">
                  <h3>Key Innovation: Zero Penalty Burns</h3>
                  <p>By never claiming early, the vault preserves 100% of the underlying S tokens. Every vS token is backed by exactly 1 S token at maturity.</p>
                </div>
              </div>

              <div className="section">
                <h2>Market Dynamics</h2>
                
                <div className="subsection">
                  <h3>Expected Price Evolution</h3>
                  <ul>
                    <li><strong>Month 0:</strong> vS trades at ~25% (immediate liquidity discount)</li>
                    <li><strong>Month 3:</strong> vS trades at ~50% (time value decreasing)</li>
                    <li><strong>Month 6:</strong> vS trades at ~70-85% (approaching maturity)</li>
                    <li><strong>Month 9:</strong> Redeem vS → S at 1:1 on our site</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3>Realistic User Behavior</h3>
                  <p>Most users will exit at 80-90% recovery ("good enough") rather than wait for full maturity. Only diamond hands hold until month 9.</p>
                </div>
              </div>

              <div className="section">
                <h2>Technical Architecture</h2>
                
                <div className="tech-grid">
                  <div className="tech-card">
                    <h3>ImmutableVault.sol</h3>
                    <ul>
                      <li><strong>Zero Admin Control:</strong> No owner, no pause, no upgrades</li>
                      <li><strong>Immutable Parameters:</strong> Set once in constructor, never changed</li>
                      <li><strong>Simple Flow:</strong> Deposit fNFT → Mint vS → Hold until maturity</li>
                      <li><strong>Wait-and-Claim:</strong> Never claims early, preserves full backing</li>
                      <li><strong>Pure Infrastructure:</strong> Works forever without intervention</li>
                    </ul>
                    <div className="contract-links">
                      <a href="https://github.com/b1rdmania/vs-token-mvp/blob/main/src/ImmutableVault.sol" target="_blank" rel="noopener noreferrer" className="contract-link">
                        View Contract →
                      </a>
                    </div>
                  </div>
                  
                  <div className="tech-card">
                    <h3>ImmutableVSToken.sol</h3>
                    <ul>
                      <li><strong>Standard ERC-20:</strong> Full DeFi composability</li>
                      <li><strong>Vault-Only Minting:</strong> Only vault can mint (deposit) or burn (redemption)</li>
                      <li><strong>No Special Features:</strong> Clean, predictable token mechanics</li>
                    </ul>
                    <div className="contract-links">
                      <a href="https://github.com/b1rdmania/vs-token-mvp/blob/main/src/ImmutableVSToken.sol" target="_blank" rel="noopener noreferrer" className="contract-link">
                        View Contract →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2>Risk Disclosure</h2>
                
                <div className="risk-grid">
                  <div className="risk-card market-realities">
                    <h3>Market Realities</h3>
                    <ul>
                      <li><strong>Pre-Maturity:</strong> vS price determined by Shadow DEX market, not protocol</li>
                      <li><strong>Market Discount:</strong> Early exit means accepting current market rate</li>
                      <li><strong>Liquidity Dependent:</strong> Large trades affected by pool depth</li>
                    </ul>
                  </div>

                  <div className="risk-card guarantees">
                    <h3>What We Guarantee</h3>
                    <ul>
                      <li><strong>1:1 Redemption:</strong> At month 9+, redeem vS → S at exactly 1:1 ratio</li>
                      <li><strong>Full Backing:</strong> Every vS backed by 1 S token (zero penalty burns)</li>
                      <li><strong>No Rug Risk:</strong> Immutable contracts, no admin control</li>
                    </ul>
                  </div>

                  <div className="risk-card no-promises">
                    <h3>What We Don't Promise</h3>
                    <ul>
                      <li><strong>Pre-maturity Pricing:</strong> Market decides vS value, not the protocol</li>
                      <li><strong>Guaranteed Returns:</strong> We don't manipulate prices or promise yields</li>
                      <li><strong>Artificial Pegs:</strong> No complex mechanisms to maintain specific ratios</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2>Shadow DEX Integration</h2>
                <p>The vS/S pool is the liquidity heart:</p>
                <ul>
                  <li><strong>Market Pricing:</strong> Pure supply/demand, no protocol intervention</li>
                  <li><strong>Standard AMM:</strong> Works with existing DeFi infrastructure</li>
                  <li><strong>Bootstrap Liquidity:</strong> Protocol can seed initial trading pairs</li>
                </ul>
              </div>

              <div className="section">
                <h2>Why This Approach Works</h2>
                
                <div className="benefits-grid">
                  <div className="benefit-card">
                    <h3>Economic Honesty</h3>
                    <p>Instead of complex vesting calculations or artificial pricing mechanisms, we let the market efficiently price time value. Users get access to their full future value today, paying only the market-determined time discount.</p>
                  </div>

                  <div className="benefit-card">
                    <h3>Maximum Security</h3>
                    <ul>
                      <li><strong>Immutable Design:</strong> No admin keys or upgrade paths</li>
                      <li><strong>Simple Logic:</strong> Fewer attack vectors than complex protocols</li>
                      <li><strong>Transparent Economics:</strong> No hidden mechanisms or surprise behaviors</li>
                    </ul>
                  </div>

                  <div className="benefit-card">
                    <h3>Real Utility</h3>
                    <ul>
                      <li><strong>Immediate Liquidity:</strong> Cash today instead of 9-month wait</li>
                      <li><strong>DeFi Composability:</strong> Use vS across the entire Sonic ecosystem</li>
                      <li><strong>Natural Appreciation:</strong> Price should converge toward 1:1 as maturity approaches</li>
                      <li><strong>User Choice:</strong> Market lets users decide acceptable discount</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2>Current Implementation</h2>
                
                <div className="implementation-grid">
                  <div className="impl-card">
                    <h3>Production Ready</h3>
                    <ul>
                      <li>Core contracts deployed on Sonic Mainnet</li>
                      <li>Shadow DEX integration complete</li>
                      <li>Frontend with full user experience</li>
                      <li>Ready for real fNFT deposits</li>
                    </ul>
                  </div>

                  <div className="impl-card">
                    <h3>Yield Opportunities</h3>
                    <p>Beyond immediate liquidity, vS tokens offer additional earning potential:</p>
                    <ul>
                      <li><strong>LP Rewards:</strong> Provide vS/S liquidity on Shadow DEX to earn trading fees</li>
                      <li><strong>Incentivized Pools:</strong> Protocol may incentivize LP positions with additional rewards</li>
                      <li><strong>DeFi Integration:</strong> Use vS tokens across Sonic's DeFi ecosystem while waiting for better exit prices</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="section bottom-line">
                <h2>The Bottom Line</h2>
                <p>vS Vault doesn't promise magic or guaranteed returns. We provide simple, honest infrastructure:</p>
                <ul>
                  <li>Deposit your fNFT, get full-value vS tokens</li>
                  <li>Trade at market rates for immediate liquidity</li>
                  <li>Redeem 1:1 at maturity if you wait</li>
                </ul>
                <p><strong>The market determines fair pricing. We just provide the rails.</strong></p>
              </div>

              <div className="cta-section">
                <Link to="/app" className="button-primary button-hero">
                  Launch App
                </Link>
                <a href="https://github.com/b1rdmania/vs-token-mvp" target="_blank" rel="noopener noreferrer" className="button-secondary button-hero">
                  View Code
                </a>
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