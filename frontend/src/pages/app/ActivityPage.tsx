import React, { useState } from 'react';
import './ActivityPage.css';

const mockActivity = [
  { date: '2024-07-20', tx: '0x123...', action: 'Deposit', amount: '4,800 S', gas: '0.005 S' },
  { date: '2024-07-20', tx: '0x456...', action: 'Mint', amount: '2,400 vS', gas: '0.003 S' },
  { date: '2024-07-21', tx: '0x789...', action: 'Swap', amount: '100 vS for 99.5 S', gas: '0.008 S' },
  { date: '2024-07-22', tx: '0xabc...', action: 'Add Liquidity', amount: '500 vS / 498 S', gas: '0.012 S' },
  { date: '2024-07-23', tx: '0xdef...', action: 'Claim', amount: '25 S', gas: '0.002 S' },
];

const mockFeeSummary = {
  mintFees: "1,500 S",
  swapFees: "850 S",
  lpDistribution: "2,350 S",
};

export const ActivityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Deposits', 'Claims', 'Swaps', 'Fees'];

  return (
    <div className="activity-page content-card">
      <h1>Protocol Activity</h1>
      <p>A live feed of all deposits, mints, swaps, and claims occurring on the vS Vault protocol.</p>
      
      <div className="fee-summary">
        <div><label>Mint Fees Earned</label><span>{mockFeeSummary.mintFees}</span></div>
        <div><label>Swap Fees Earned</label><span>{mockFeeSummary.swapFees}</span></div>
        <div><label>Distribution to LPs</label><span>{mockFeeSummary.lpDistribution}</span></div>
      </div>

      <div className="activity-table-container">
        <div className="filter-tabs">
          {tabs.map(tab => (
            <button 
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Tx</th>
              <th>Action</th>
              <th>Amount S</th>
              <th>Gas (S)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mockActivity.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{`${item.tx.slice(0, 6)}...${item.tx.slice(-4)}`}</td>
                <td>{item.action}</td>
                <td>{item.amount}</td>
                <td>{item.gas}</td>
                <td><a href="#" className="explorer-link">↗</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 