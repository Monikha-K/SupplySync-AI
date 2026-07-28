import React from 'react';

export default function PredictionHistoryCard({ historyLogs, onRefreshHistory }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          📜 SQLite Prediction History & Autonomous Action Audit Log
        </div>
        <button
          className="btn btn-secondary"
          style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
          onClick={onRefreshHistory}
        >
          🔄 Refresh History
        </button>
      </div>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Shipment ID</th>
              <th>Risk Score</th>
              <th>Level</th>
              <th>Expected Delay</th>
              <th>Action Executed</th>
              <th>Customer Email</th>
            </tr>
          </thead>
          <tbody>
            {(!historyLogs || historyLogs.length === 0) ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                  No predictions logged yet.
                </td>
              </tr>
            ) : (
              historyLogs.map((log) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString();
                const isHigh = log.risk_score >= 70;
                const badgeClass = isHigh ? 'tag-danger' : (log.risk_score >= 40 ? 'tag-warning' : 'tag-success');

                return (
                  <tr key={log.id || log.timestamp + log.shipment_id}>
                    <td style={{ fontFamily: 'monospace' }}>{timeStr}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#60a5fa' }}>{log.shipment_id}</td>
                    <td><span className={`tag ${badgeClass}`} style={{ fontWeight: 700 }}>{log.risk_score}</span></td>
                    <td><strong>{log.risk_level}</strong></td>
                    <td>{log.expected_delay}</td>
                    <td style={{ fontSize: '12px' }}>{log.action_taken}</td>
                    <td>
                      {log.customer_notified ? (
                        <span className="tag tag-success">✉️ Sent</span>
                      ) : (
                        <span className="tag">None</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
