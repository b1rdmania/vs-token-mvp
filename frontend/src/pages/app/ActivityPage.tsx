import React from 'react';

const mockActivities = [
  { id: 1, type: 'Deposit', amount: '10,000 vS', date: '2024-07-21 14:30', tx: '0x123...abc' },
  { id: 2, type: 'Redeem', amount: '500 S', date: '2024-07-21 10:15', tx: '0x456...def' },
  { id: 3, type: 'Stream Claim', amount: '12.5 S', date: '2024-07-21 08:00', tx: '0x789...ghi' },
  { id: 4, type: 'Deposit', amount: '5,000 vS', date: '2024-07-20 18:45', tx: '0xabc...123' },
  { id: 5, type: 'Pool: Add Liquidity', amount: '1,000 vS/S', date: '2024-07-20 12:00', tx: '0xdef...456' },
];

export const ActivityPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Protocol Activity</h1>
      <div className="content-card">
        <h2>Recent Transactions</h2>
        <table className="activity-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Transaction</th>
            </tr>
          </thead>
          <tbody>
            {mockActivities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.type}</td>
                <td>{activity.amount}</td>
                <td>{activity.date}</td>
                <td>
                  <a href={`#`} target="_blank" rel="noopener noreferrer">{activity.tx}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 