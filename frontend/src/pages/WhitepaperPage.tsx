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
          <p className="version">Version 1.1 – Last updated 20 Jun 2025</p>

          <section>
            <h2>1. Why vS Vault Exists</h2>
            <p>Sonic's airdrop locks 75 % of rewards in 9-month vesting NFTs. Great for supply discipline, terrible for users who want to move capital. Most will dump their 25 % liquid slice and forget Sonic. vS Vault unlocks the locked share without breaking the vest schedule—turning dead capital into tradable, yield-bearing liquidity.</p>
          </section>

          <section>
            <h2>2. At-a-Glance</h2>
            <ul>
              <li>Total fNFTs in Season-1: 90 M S</li>
              <li>User action: deposit fNFT → receive 1:1 <code>vS</code> tokens</li>
              <li><code>vS</code> tokens: standard ERC-20, tradable, LP-able, lendable</li>
              <li>Underlying S continues vesting; unlocked S streams to <code>vS</code> holders daily</li>
            </ul>
          </section>

          <section>
            <h2>3. How the Flow Works</h2>
            <p><strong>Deposit</strong> – user sends fNFT to the Vault contract</p>
            <p><strong>Mint</strong> – Vault mints equal <code>vS</code> balance to the user</p>
            <p><strong>Trade / LP</strong> – user swaps or LPs <code>vS</code>/S to earn fees</p>
            <p><strong>Stream</strong> – Vault auto-claims newly-unlocked S each day and distributes pro-rata to <code>vS</code> balances</p>
            <p><strong>Redeem</strong> – when vest hits 100 %, user burns <code>vS</code> to withdraw remaining S (early redemption allowed but pays the same penalty curve baked into the fNFT)</p>
          </section>

          <section>
            <h2>4. Smart-Contract Anatomy</h2>
            <h3><a href="https://github.com/b1rdmania/vs-token-mvp/blob/main/src/vSVault.sol" target="_blank" rel="noopener noreferrer">vSVault.sol</a></h3>
            <ul>
              <li>ERC-4626 compliant, owns all fNFTs</li>
              <li>Reads vesting schedule, tracks claimable S</li>
              <li>Auto-stream function anyone can trigger (gas refund)</li>
            </ul>
            <h3><a href="https://github.com/b1rdmania/vs-token-mvp/blob/main/src/vSToken.sol" target="_blank" rel="noopener noreferrer">vSToken.sol</a></h3>
            <ul>
              <li>ERC-20 with EIP-2612 permits</li>
              <li>Mint / burn controlled by the Vault only</li>
            </ul>
            <h3><a href="https://github.com/b1rdmania/vs-token-mvp/blob/main/src/PenaltyCurveLib.sol" target="_blank" rel="noopener noreferrer">PenaltyCurveLib.sol</a></h3>
            <ul>
              <li>Pure library replicating Sonic's linear burn formula for early exits</li>
            </ul>
          </section>

          <section>
            <h2>5. Deep DeFi Composability &amp; The Flywheel Effect</h2>
            <p><code>vS</code> is more than a liquid token; it's a foundational building block for the Sonic ecosystem. By converting locked fNFTs into a standard, permissionless ERC-20, vS Vault unlocks immediate composability with other DeFi protocols.</p>
            <ul>
                <li><strong>Lending &amp; Borrowing:</strong> <code>vS</code> can be listed as collateral on lending markets, allowing users to borrow against their vesting assets without selling.</li>
                <li><strong>Yield Aggregation:</strong> Vaults and yield aggregators can build strategies on top of the core <code>vS</code>/S liquidity pool.</li>
                <li><strong>The Flywheel Engine: The <code>vS</code>/S Pool:</strong> The heart of this ecosystem will be a deeply liquid <code>vS</code>/S pool, launching on our strategic partner, <strong>Shadow DEX</strong>. A significant portion of protocol incentives will be directed to this pool, creating a powerful flywheel.</li>
            </ul>
            <p>This model transforms static, vesting assets into a dynamic engine for ecosystem-wide liquidity and growth.</p>
          </section>

          <section>
            <h2>6. Decentralized &amp; Battle-Hardened Architecture</h2>
            <p>The vS Vault is engineered for maximum uptime, security, and transparency, removing all centralized points of failure.</p>
            <ul>
                <li><strong>Immutable by Design:</strong> The core contracts are non-upgradeable. The code deployed is final, ensuring predictable behavior and removing administrative risk.</li>
                <li><strong>Reliable Automation via Keepers:</strong> The daily <code>auto-stream</code> function is not run from a private server. It is driven by a decentralized automation network (e.g., Chainlink Automation) that guarantees execution.</li>
                <li><strong>Public Incentivization:</strong> As a backstop, the <code>auto-stream</code> function includes a gas incentive, making it profitable for any public user or bot to trigger it. This ensures the protocol is self-healing and perpetually live.</li>
                <li><strong>Transparent Data via Subgraph:</strong> All data for the user interface is indexed from on-chain events via a public Subgraph. This guarantees that what you see is a direct and verifiable reflection of on-chain reality.</li>
            </ul>
          </section>

          <section>
            <h2>7. Security &amp; Audits</h2>
            <ul>
              <li>Built with <a href="https://github.com/b1rdmania/vs-token-mvp/tree/main/lib/openzeppelin-contracts/contracts" target="_blank" rel="noopener noreferrer">OpenZeppelin templates</a>, no owner functions, no upgradeability in V1</li>
              <li>Audit booked with BlockSec, report live before airdrop launch (1 Jul 2025)</li>
              <li>$25 k Immunefi bug bounty live from testnet day-one</li>
            </ul>
          </section>
          
          <section>
            <h2>8. Economic Impact for Sonic</h2>
            <ul>
              <li>Deep <code>vS</code>/S liquidity absorbs airdrop sell pressure</li>
              <li>Locked capital becomes TVL, boosting headline metrics</li>
              <li>Continuous swap volume drives fee burn, aligning with S token economics</li>
              <li>More "things to do" on-chain keeps users active during the 9-month vest window</li>
            </ul>
          </section>
          
          <section>
            <h2>9. Launch Parameters (testnet → mainnet)</h2>
            <ul>
              <li>Testnet beta: contracts live, subgraph indexing, UI functional</li>
              <li>Mainnet launch target: 1 Jul 2025 (before Season-1 claim portal opens)</li>
              <li>Initial liquidity: 250 k S + 250 k <code>vS</code> seeded by team</li>
              <li>Partner gauge incentives: 500 k S over first 30 days</li>
            </ul>
          </section>
          
          <section>
            <h2>10. Get Involved</h2>
            <p>Seed liquidity, integrate <code>vS</code> in your dApp, or <a href="https://github.com/b1rdmania/vs-token-mvp" target="_blank" rel="noopener noreferrer">review the code</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}; 