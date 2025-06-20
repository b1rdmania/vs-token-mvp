import React from 'react';
import './DashboardPage.css';

const mockDashboardData = {
  totalVsBalance: 12500.75,
  unlockedS: 150.22,
  currentApy: 18.5,
  nextUnlock: '12h 45m',
  vestCompletedPercent: 25,
  nftsInVault: [
    { id: '#001', principal: '10,000 S', maturity: 'in 9 months' },
    { id: '#002', principal: '5,000 S', maturity: 'in 6 months' },
  ],
  unlockedToday: 25,
};

export const DashboardPage: React.FC = () => {
  const data = mockDashboardData;

  return (
    <div className="page-container">
      <h1 className="page-title">My Dashboard</h1>
      <div className="data-freshness-notice">
        <p>Balances reflect on-chain data from the public Subgraph. The vault streams new rewards approximately every 6 hours.</p>
      </div>

      <div className="stats-row">
        <div className="content-card stat-card-dash">
          <label>Total vS Balance</label>
          <span>{data.totalVsBalance.toLocaleString()} vS</span>
        </div>
        <div className="content-card stat-card-dash">
          <label>Unlocked S Streamed</label>
          <span>{data.unlockedS.toLocaleString()} S</span>
        </div>
        <div className="content-card stat-card-dash">
          <label>Next Unlock In</label>
          <span>{data.nextUnlock}</span>
        </div>
      </div>

      <div className="content-card">
        <div className="progress-info">
          <label>Overall Vesting Progress</label>
          <span>{data.vestCompletedPercent}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${data.vestCompletedPercent}%` }}></div>
        </div>
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

      <div className="content-card claim-panel">
        <div>
          <label>Mintable vS</label>
          <span>{data.unlockedToday.toLocaleString()} vS</span>
        </div>
        <button className="button-primary" disabled={data.unlockedToday <= 0}>
          Mint vS
        </button>
      </div>
    </div>
  );
}; 