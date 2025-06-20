import React from 'react';
import { NavLink, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { DepositPage } from '../../pages/app/DepositPage';
import { DashboardPage } from '../../pages/app/DashboardPage';
import { TradePage } from '../../pages/app/TradePage';
import { PoolPage } from '../../pages/app/PoolPage';
import { ActivityPage } from '../../pages/app/ActivityPage';
import { RedeemPage } from '../../pages/app/RedeemPage';
import './AppShell.css';

const navLinks = [
  { path: '/app/deposit', label: 'Deposit' },
  { path: '/app/redeem', label: 'Redeem' },
  { path: '/app/dashboard', label: 'Dashboard' },
  { path: '/app/trade', label: 'Trade' },
  { path: '/app/pool', label: 'Pool' },
  { path: '/app/activity', label: 'Protocol Activity' },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container header-content">
          <div className="logo-section">
            <Link to="/" className="logo">vS Vault</Link>
            <span className="beta-badge">TESTNET BETA</span>
          </div>
          <div className="wallet-section">
            <ConnectButton />
          </div>
        </div>
      </header>
      <nav className="app-nav">
        <div className="container">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
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