import React, { useState } from 'react';
import { NavLink, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { DepositPage } from '../../pages/app/DepositPage';
import { DashboardPage } from '../../pages/app/DashboardPage';
import { TradePage } from '../../pages/app/TradePage';
import { PoolPage } from '../../pages/app/PoolPage';
import { ActivityPage } from '../../pages/app/ActivityPage';
import { RedeemPage } from '../../pages/app/RedeemPage';
import './AppShell.css';
import { useAccount } from 'wagmi';

const navLinks = [
  { path: '/app/deposit', label: 'Deposit' },
  { path: '/app/redeem', label: 'Redeem' },
  { path: '/app/dashboard', label: 'Dashboard' },
  { path: '/app/trade', label: 'Trade' },
  { path: '/app/pool', label: 'Pool' },
  { path: '/app/activity', label: 'Protocol Activity' },
];

const navLinkStyles = ({ isActive }: { isActive: boolean }) => ({
  borderBottom: isActive ? '2px solid #0d6efd' : '2px solid transparent',
  color: isActive ? '#0d6efd' : '#212529',
  fontWeight: isActive ? '700' : '500',
});

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { isConnected } = useAccount();
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-container">
          <Link to="/" className="logo">
            vS Vault
            <span className="testnet-badge">TESTNET BETA</span>
          </Link>

          <nav className="nav-links">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} style={navLinkStyles}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <ConnectButton />
          </div>

          <button className="hamburger-menu" onClick={() => setMenuOpen(!isMenuOpen)}>
            &#9776;
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <nav className="mobile-nav-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              style={navLinkStyles}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mobile-wallet-connect">
            <ConnectButton />
          </div>
        </nav>
      )}

      <main className="app-main">
        <div className="container">
          <Routes>
            <Route path="deposit" element={<DepositPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="trade" element={<TradePage />} />
            <Route path="pool" element={<PoolPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="redeem" element={<RedeemPage />} />
            <Route index element={<Navigate to="deposit" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}; 