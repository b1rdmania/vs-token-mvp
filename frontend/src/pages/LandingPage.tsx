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
 * 2. Interactive Stepper: 60-second explanation with hover tooltips
 * 3. Benefits Grid: 6 key advantages with animations and modern cards  
 * 4. Sticky Economics Bar: Fee structure always visible
 * 5. Why Sonic: Ecosystem benefits in icon cards
 * 6. FAQ: Improved accordion with icons
 * 7. Final CTA: Gradient footer with primary action
 * 
 * @design_principles
 * - Modern DeFi aesthetic with gradients and animations
 * - Framer Motion for smooth interactions
 * - React Icons for crisp iconography
 * - Sticky economics bar for transparency
 * - Enhanced mobile responsiveness
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, QuestionMarkCircleIcon } from 'react-icons/hi2';
import { TrendingUpIcon, WaveIcon, PuzzlePieceIcon } from 'react-icons/hi';
import { StepIndicator } from '../components/StepIndicator';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      setShowStickyBar(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stepData = [
    { id: 1, label: "Deposit", tooltip: "Send fNFT to vault" },
    { id: 2, label: "Mint vS (-1%)", tooltip: "Get liquid tokens instantly" },
    { id: 3, label: "Trade / LP", tooltip: "Use in any DeFi protocol" },
    { id: 4, label: "Month-9 harvest", tooltip: "Vault claims at 0% burn" },
    { id: 5, label: "Redeem 1:1 (-2%)", tooltip: "Exchange vS for S tokens" }
  ];

  const benefitVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="landing-page-modern">
      {/* Sticky Economics Bar */}
      {showStickyBar && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="sticky top-0 z-30 bg-slate-900 text-white py-2 text-center text-sm md:text-base"
        >
          <span className="mx-2">Fees: 1% mint • 2% redeem</span>
          <span className="mx-2">|</span>
          <span className="mx-2">Total cost ≈3% to skip 9-month wait</span>
          <span className="mx-2">|</span>
          <span className="mx-2">Net to you ≈97%</span>
        </motion.div>
      )}

      <header className="landing-header">
        <div className="container header-content">
          <div className="logo">vS Vault</div>
          <Link to="/app" className="button-primary">
            Launch App
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section - Full Bleed Gradient */}
        <section className="hero-section-gradient">
          <div className="container">
            <div className="hero-grid">
              <motion.div 
                className="hero-content"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="hero-title-modern">
                  Turn Locked Tokens into Cash
                </h1>
                <p className="hero-subtitle-modern">
                  Deposit your locked fNFT. Get vS tokens worth the full amount. Sell them for cash today.
                </p>
                <div className="hero-buttons-modern">
                  <Link to="/app" className="button-primary-modern">
                    Launch App
                  </Link>
                  <a href="https://github.com/b1rdmania/vs-token-mvp" target="_blank" rel="noopener noreferrer" className="button-secondary-modern">
                    GitHub
                  </a>
                  <Link to="/whitepaper" className="button-secondary-modern">
                    White Paper
                  </Link>
                </div>
              </motion.div>
              <motion.div 
                className="hero-visual"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flow-diagram">
                  <div className="flow-text">fNFT → Vault → vS → DeFi</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Interactive Stepper */}
        <section className="stepper-section">
          <div className="container">
            <StepIndicator title="60-Second Flow" steps={stepData} />
          </div>
        </section>

        {/* Key Benefits - Animated Cards */}
        <section className="benefits-section-modern">
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Key Benefits
            </motion.h2>
            <motion.div 
              className="benefits-grid-modern"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { emoji: "⚡", title: "Immediate Liquidity", text: "Unlock full face value on day 0." },
                { emoji: "⚖️", title: "Fair Pricing", text: "Market sets the time price, not us." },
                { emoji: "🔥", title: "Zero Penalty Burns", text: "Vault waits for 0% burn window." },
                { emoji: "🧩", title: "DeFi Ready", text: "Pure ERC-20 plugs into any Sonic pool." },
                { emoji: "🛡️", title: "No Rug Risk", text: "Immutable code, no admin keys." },
                { emoji: "🎯", title: "1:1 Redemption", text: "Every vS is backed by S after harvest." }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  className="benefit-card-modern"
                  variants={benefitVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="benefit-emoji">{benefit.emoji}</div>
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-text">{benefit.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why Sonic - Icon Cards */}
        <section className="why-sonic-modern">
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why this is good for Sonic
            </motion.h2>
            <div className="sonic-benefits-grid">
              {[
                {
                  icon: <TrendingUpIcon className="w-8 h-8" />,
                  title: "Adds TVL",
                  text: "Locked value turns into LP depth & swap fees"
                },
                {
                  icon: <WaveIcon className="w-8 h-8" />,
                  title: "Smoother Price",
                  text: "Sell pressure drips instead of nuking day-one"
                },
                {
                  icon: <PuzzlePieceIcon className="w-8 h-8" />,
                  title: "More DeFi Lego",
                  text: "Users stay to farm / lend → sticky ecosystem"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="sonic-benefit-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="sonic-icon">{item.icon}</div>
                  <h3 className="sonic-title">{item.title}</h3>
                  <p className="sonic-text">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ with Icons */}
        <section className="faq-section-modern">
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              FAQ
            </motion.h2>
            <div className="faq-accordion-modern">
              <details open>
                <summary>
                  <QuestionMarkCircleIcon className="w-5 h-5" />
                  Can the fees change?
                </summary>
                <p>No. 1% in, 2% out are hard-coded in an upgrade-blocked contract.</p>
              </details>
              <details>
                <summary>
                  <QuestionMarkCircleIcon className="w-5 h-5" />
                  Is the 1:1 real?
                </summary>
                <p>Yes. Vault claims every S at 0% burn; redeem burns vS and releases S.</p>
              </details>
              <details>
                <summary>
                  <QuestionMarkCircleIcon className="w-5 h-5" />
                  What if a claim fails?
                </summary>
                <p>The harvest retries in 20-NFT batches until every token is collected. Redeems stay pro-rata meanwhile.</p>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA - Gradient Footer */}
        <section className="final-cta-gradient">
          <div className="container">
            <motion.div
              className="cta-content"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="cta-title">Ready?</h2>
              <p className="cta-subtitle">Connect wallet → deposit fNFT → mint vS.</p>
              <p className="cta-tagline">
                <em>Turn waiting into doing.</em>
              </p>
              <Link to="/app" className="button-primary-large">
                Launch App
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="landing-footer-modern">
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
