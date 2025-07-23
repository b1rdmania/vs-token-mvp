import React, { useState } from 'react';
import { NavLink, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { DepositPage } from '../../pages/app/DepositPage';
import { TradePage } from '../../pages/app/TradePage';
import { RedeemPage } from '../../pages/app/RedeemPage';
import './AppShell.css';
import { useAccount } from 'wagmi';

const navLinks = [
  { path: '/app/deposit', label: 'Deposit' },
  { path: '/app/trade', label: 'vS / S Pool' },
  { path: '/app/redeem', label: 'Redeem' },
];

export const AppShell: React.FC = () => {
  const location = useLocation();
  const { isConnected } = useAccount();
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-container">
          <Link to="/" className="logo">
            vS Vault
          </Link>
          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={({ isActive }) => (isActive ? 'active' : '')}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <ConnectButton />
            <button className="hamburger-menu" onClick={() => setMenuOpen(!isMenuOpen)}>
              &#9776;
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <nav className="mobile-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="app-main">
        <div className="container">
          <Routes>
            <Route path="deposit" element={<DepositPage />} />
            <Route path="trade" element={<TradePage />} />
            <Route path="redeem" element={<RedeemPage />} />
            <Route index element={<Navigate to="deposit" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}; 