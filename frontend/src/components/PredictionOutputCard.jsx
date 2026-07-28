import React from 'react';

export default function PredictionOutputCard({
  prediction,
  batchSummary,
  isLoading
}) {
  const isHighRisk = prediction && prediction.risk_score >= 70;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          🤖 Autonomous AI Prediction Output
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {prediction ? new Date(prediction.timestamp).toLocaleTimeString() : 'Waiting for execution...'}
        </span>
      </div>

      {/* Batch Summary Container */}
      {batchSummary && (
        <div style={{ marginBottom: '20px', background: 'rgba(37, 99, 235, 0.12)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ color: 'var(--heading)', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚡ Batch AI Risk Prediction Summary
            </h4>
            <span style={{ fontSize: '11px', background: 'var(--primary)', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {batchSummary.total} Active Shipments Evaluated
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>High Risk Triggered</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--danger)' }}>{batchSummary.highRisk}</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Emails Dispatched</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>{batchSummary.emails}</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Monitored Safe</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--secondary)' }}>{batchSummary.safe}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="pulse-loader">
          <div className="spinner"></div>
          <span>Gemini AI Agent is analyzing multi-factor logistics risk...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !prediction && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>Select a shipment and click "Trigger Gemini Risk Reasoning Agent" to begin autonomous analysis.</p>
        </div>
      )}

      {/* Prediction Output Result */}
      {!isLoading && prediction && (
        <div className="result-container active">
          <div className="gauge-section">
            <div className="gauge-details">
              <h3>{prediction.risk_level} Risk Level</h3>
              <p>Predicted Issue: {prediction.predicted_issue}</p>
              <p style={{ color: '#60a5fa', fontWeight: 600, marginTop: '4px' }}>Expected Delay: {prediction.expected_delay}</p>
            </div>
            <div className={`score-circle ${prediction.risk_level.toLowerCase()}`}>
              <span>{prediction.risk_score}</span>
              <span className="score-label">Risk Score</span>
            </div>
          </div>

          <div className={`action-banner ${isHighRisk ? 'high-risk' : 'monitored'}`}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <span>
              {isHighRisk ? (
                <><strong>High Risk Triggered (Score {prediction.risk_score} &ge; 70%):</strong> Customer Communication Agent Autonomously Executed!</>
              ) : (
                <><strong>Low/Medium Risk (Score {prediction.risk_score} &lt; 70%):</strong> Shipment Monitored - No Customer Action Required.</>
              )}
            </span>
          </div>

          <div className="details-grid">
            <div className="info-box">
              <h4>Root Cause Analysis</h4>
              <ul>
                {(prediction.reason || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="info-box">
              <h4>Recommended Corrective Actions</h4>
              <ul>
                {(prediction.recommended_action || []).map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Email Preview */}
          {prediction.customer_notified && prediction.email_content && (
            <div className="email-preview">
              <div className="email-header">
                📬 <strong>Customer Communication Agent Output</strong> • Status: <span style={{ color: '#4ade80', fontWeight: 600 }}>{prediction.email_content.status || 'Dispatched'}</span>
              </div>
              <div style={{ fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>
                <strong>To:</strong> {prediction.email_content.recipient}
              </div>
              <div className="email-subject">{prediction.email_content.subject}</div>
              <div className="email-body">{prediction.email_content.body}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
