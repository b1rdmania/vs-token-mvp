import React from 'react';
import './DashboardPage.css';

const mockDashboardData = {
  totalVsBalance: 12500.75,
  unlockedS: 150.22,
  currentApy: 18.5,
  nextUnlock: '12h 45m',
  vestCompletedPercent: 25,
  nftsInVault: [
    { id: 1234, lockedS: 4800, unlockedSoFar: 1200, daysUntilVested: 180 },
    { id: 5678, lockedS: 10000, unlockedSoFar: 2500, daysUntilVested: 180 },
  ],
  unlockedToday: 25,
};

export const DashboardPage: React.FC = () => {
  const data = mockDashboardData;

  return (
    <div className="dashboard-page">
      <h1 className="page-title">My Dashboard</h1>
      <div className="data-freshness-notice">
        <p>Balances reflect on-chain data from the public Subgraph. The vault streams new rewards approximately every 6 hours.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card-dash">
          <label>Total vS Balance</label>
          <span>{data.totalVsBalance.toLocaleString()} vS</span>
        </div>
        <div className="stat-card-dash">
          <label>Unlocked S Streamed</label>
          <span>{data.unlockedS.toLocaleString()} S</span>
        </div>
        <div className="stat-card-dash">
          <label>Next Unlock In</label>
          <span>{data.nextUnlock}</span>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-info">
          <label>Overall Vesting Progress</label>
          <span>{data.vestCompletedPercent}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${data.vestCompletedPercent}%` }}></div>
        </div>
      </div>

      <div className="table-card">
        <h3>Your NFTs in Vault</h3>
        <table>
          <thead>
            <tr>
              <th>NFT ID</th>
              <th>Locked S</th>
              <th>Unlocked so far</th>
              <th>Days until fully vested</th>
            </tr>
          </thead>
          <tbody>
            {data.nftsInVault.map(nft => (
              <tr key={nft.id}>
                <td>{nft.id}</td>
                <td>{nft.lockedS.toLocaleString()}</td>
                <td>{nft.unlockedSoFar.toLocaleString()}</td>
                <td>{nft.daysUntilVested}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="claim-panel">
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