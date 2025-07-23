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
                    <li><strong>Trade:</strong> User trades vS on Beets at market rates for instant liquidity</li>
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
                    <h3>Vault.sol</h3>
                    <ul>
                      <li><strong>Secure Upgradeability:</strong> All protocol changes require multisig approval and a public timelock (12h for upgrades, 2h for emergency actions)</li>
                      <li><strong>Governance-Controlled Parameters:</strong> Fee rates and core logic can only change via a public, timelocked upgrade process</li>
                      <li><strong>Simple Flow:</strong> Deposit fNFT → Mint vS → Hold until maturity</li>
                      <li><strong>Wait-and-Claim:</strong> Never claims early, preserves full backing</li>
                      <li><strong>Transparent Infrastructure:</strong> All upgrades are public and delayed for user protection</li>
                    </ul>
                    <div className="contract-links">
                      <a href="https://sonicscan.org/address/0xE2BB365a107441C1734a7aC08930dbEbb421249d" target="_blank" rel="noopener noreferrer" className="contract-link">
                        View Contract →
                      </a>
                    </div>
                  </div>
                  
                  <div className="tech-card">
                    <h3>VSToken.sol</h3>
                    <ul>
                      <li><strong>Standard ERC-20:</strong> Full DeFi composability</li>
                      <li><strong>Vault-Only Minting:</strong> Only vault can mint (deposit) or burn (redemption)</li>
                      <li><strong>Upgradeable for Security:</strong> Bug fixes and improvements possible via multisig governance</li>
                      <li><strong>No Transfer Taxes or Rebasing:</strong> Clean, predictable token mechanics</li>
                    </ul>
                    <div className="contract-links">
                      <a href="https://sonicscan.org/address/0x2286bA4fcbb2eF06C4349fAF6B8970ece593f5DD" target="_blank" rel="noopener noreferrer" className="contract-link">
                        View Contract →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2>Fee Structure</h2>
                
                <div className="fee-breakdown">
                  <div className="fee-card">
                    <h3>Protocol Fees (Governance-Controlled)</h3>
                    <ul>
                      <li><strong>Mint Fee:</strong> 1% when depositing fNFT → vS</li>
                      <li><strong>Redeem Fee:</strong> 2% when redeeming vS → S</li>
                      <li><strong>Keeper Fee:</strong> 0% (self-keeper mode)</li>
                      <li><strong>Changes:</strong> Any fee change requires multisig approval and a 12h public timelock</li>
                    </ul>
                  </div>

                  <div className="fee-card">
                    <h3>User Economics</h3>
                    <p><strong>Full Cycle Cost:</strong> ~3% total protocol fees</p>
                    <p><strong>Net Efficiency:</strong> ~97% of original fNFT value</p>
                    <p><strong>Example:</strong> Deposit 1000 S fNFT → Get 990 vS → Redeem for ~970 S</p>
                  </div>

                  <div className="fee-card">
                    <h3>Fee Justification</h3>
                    <ul>
                      <li><strong>Protocol Sustainability:</strong> Fees fund ongoing development and infrastructure</li>
                      <li><strong>Market Competitive:</strong> 3% total cost vs 9-month opportunity cost</li>
                      <li><strong>Value Creation:</strong> Immediate liquidity worth the small fee</li>
                      <li><strong>Transparent Changes:</strong> Fees can only change through a public, timelocked upgrade process controlled by the protocol's multisig</li>
                    </ul>
                  </div>
                </div>

                <div className="highlight-box">
                  <h3>Fee Transparency</h3>
                  <p><strong>Fees</strong>: 1% when you mint vS, 2% when you redeem. Net cost ≈ 3% for nine-month liquidity.</p>
                  <p>All fees are clearly displayed in the UI before any transaction. No hidden costs, no surprise deductions. Any changes require multisig approval and a public timelock.</p>
                </div>
              </div>

              <div className="section">
                <h2>Risk Disclosure</h2>
                
                <div className="risk-grid">
                  <div className="risk-card market-realities">
                    <h3>Market Realities</h3>
                    <ul>
                      <li><strong>Pre-Maturity:</strong> vS price determined by Beets market, not protocol</li>
                      <li><strong>Market Discount:</strong> Early exit means accepting current market rate</li>
                      <li><strong>Liquidity Dependent:</strong> Large trades affected by pool depth</li>
                    </ul>
                  </div>

                  <div className="risk-card guarantees">
                    <h3>What We Guarantee</h3>
                    <ul>
                      <li><strong>1:1 Redemption:</strong> At month 9+, redeem vS → S at 1:1 ratio (minus 2% fee)</li>
                      <li><strong>Full Backing:</strong> Every vS backed by 1 S token (zero penalty burns)</li>
                      <li><strong>No Rug Risk:</strong> Upgrades and emergency actions require multisig consensus and a public timelock. No single party can make changes</li>
                      <li><strong>Transparent Governance:</strong> All protocol changes are public, multisig-controlled, and delayed for user protection</li>
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
                <h2>Beets Integration</h2>
                <p>
                  The vS Vault will integrate with Beets to provide immediate liquidity for vS tokens. 
                  This integration will enable users to trade their vS tokens at market-determined prices without waiting 
                  for the maturity period.
                </p>
                
                <h3>Weighted Pool Structure</h3>
                <p>
                  Liquidity for vS will be provided via a weighted pool on Beets. 
                  This structure ensures stable price discovery, minimal impermanent loss for LPs, and enables 
                  automated arbitrage via Balancer's smart order router.
                </p>
                
                <h3>Benefits of Beets Integration</h3>
                <ul>
                  <li><strong>Deep Liquidity:</strong> Access to Balancer's extensive liquidity network</li>
                  <li><strong>Smart Order Routing:</strong> Optimal trade execution across multiple pools</li>
                  <li><strong>LP Incentives:</strong> Earn trading fees plus potential token rewards</li>
                  <li><strong>Composability:</strong> vS tokens work seamlessly with other Balancer protocols</li>
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
                      <li><strong>Secure Upgradeability:</strong> All protocol changes require multisig approval and a public timelock, so users always have time to review and respond</li>
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
                      <li>Beets integration complete</li>
                      <li>Frontend with full user experience</li>
                      <li>Ready for real fNFT deposits</li>
                    </ul>
                  </div>

                  <div className="impl-card">
                    <h3>Yield Opportunities</h3>
                    <p>Beyond immediate liquidity, vS tokens offer additional earning potential:</p>
                    <ul>
                      <li><strong>LP Rewards:</strong> Provide vS/S liquidity on Beets to earn trading fees</li>
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