import React from 'react';
import './DashboardPage.css';

// Mock data, replace with actual data
const mockDashboardData = {
  totalVsBalance: 12500.75,
  unlockedS: 150.22,
  nextUnlock: '12h 45m',
  vestCompletedPercent: 25,
  nftsInVault: [
    { id: '#001', principal: '10,000 S', maturity: 'in 9 months' },
    { id: '#002', principal: '5,000 S', maturity: 'in 6 months' },
  ],
  mintableVs: 25,
};

export const DashboardPage: React.FC = () => {
  const data = mockDashboardData;

  return (
    <div className="page-container">
      <h1 className="page-title">My Dashboard</h1>
      <div className="data-freshness-notice">
        <p>Balances reflect on-chain data from the public Subgraph. The vault streams new rewards approximately every 6 hours.</p>
      </div>

      <div className="dashboard-grid">
        <div className="content-card stat-card">
          <h3>Total vS Balance</h3>
          <p className="stat-value">{data.totalVsBalance.toLocaleString()} vS</p>
        </div>
        <div className="content-card stat-card">
          <h3>Unlocked S Streamed</h3>
          <p className="stat-value">{data.unlockedS.toLocaleString()} S</p>
        </div>
        <div className="content-card stat-card">
          <h3>Next Unlock In</h3>
          <p className="stat-value">{data.nextUnlock}</p>
        </div>
      </div>

      <div className="content-card">
        <h3>Overall Vesting Progress</h3>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${data.vestCompletedPercent}%` }}></div>
        </div>
        <p className="progress-label">{data.vestCompletedPercent}% Complete</p>
      </div>

      <div className="content-card">
        <h3>Your NFTs in Vault</h3>
        <table className="activity-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Principal</th>
              <th>Maturity</th>
            </tr>
          </thead>
          <tbody>
            {data.nftsInVault.map(nft => (
              <tr key={nft.id}>
                <td>{nft.id}</td>
                <td>{nft.principal}</td>
                <td>{nft.maturity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="content-card mint-panel">
        <div>
          <h3>Mintable vS</h3>
          <p className="stat-value">{data.mintableVs.toLocaleString()} vS</p>
        </div>
        <button className="button-primary" disabled={data.mintableVs <= 0}>
          Mint vS
        </button>
      </div>
    </div>
  );
}; 