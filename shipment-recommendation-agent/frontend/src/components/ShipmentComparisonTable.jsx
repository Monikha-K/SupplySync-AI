import React from 'react';
import './ShipmentComparisonTable.css';

const ShipmentComparisonTable = ({ recommended, others, rejected }) => {
  const allCompared = [];
  if (recommended) {
    allCompared.push({
      id: recommended.shipmentId,
      org: recommended.organizationName,
      score: recommended.recommendationScore,
      status: 'Recommended',
      reasons: recommended.decisionReasons || []
    });
  }

  others.forEach((shipment) => {
    allCompared.push({
      id: shipment.shipmentId,
      org: shipment.organizationName,
      score: shipment.recommendationScore,
      status: 'Alternative',
      reasons: shipment.decisionReasons || []
    });
  });

  return (
    <div className="comparison-card">
      <h3 className="comparison-title">Comparison Analysis</h3>
      
      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Rank/Status</th>
              <th>Shipment</th>
              <th>Score</th>
              <th>Key Reason</th>
            </tr>
          </thead>
          <tbody>
            {allCompared.map((item, index) => (
              <tr key={item.id} className={item.status === 'Recommended' ? 'row-recommended' : 'row-alternative'}>
                <td>
                  <span className={`status-pill ${item.status.toLowerCase()}`}>
                    {item.status === 'Recommended' ? '🏆 1' : index + 1}
                  </span>
                </td>
                <td>
                  <div className="shipment-id">{item.id}</div>
                  <div className="org-name">{item.org}</div>
                </td>
                <td>
                  <div className="score-value">{item.score}%</div>
                </td>
                <td>
                  <ul className="reason-list-mini">
                    {item.reasons.slice(0, 2).map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </td>
              </tr>
            ))}
            
            {rejected.slice(0, 3).map((item) => (
              <tr key={item.shipmentId} className="row-rejected">
                <td><span className="status-pill rejected">Rejected</span></td>
                <td>
                  <div className="shipment-id">{item.shipmentId}</div>
                </td>
                <td>-</td>
                <td>{item.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShipmentComparisonTable;
