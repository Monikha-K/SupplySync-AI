import React from 'react';

const AcceptanceSummary = ({ shipment, onReset }) => {
  const confidence = (shipment.organizationRating / 5 * 100).toFixed(0);

  return (
    <div className="acceptance-card">
      {/* ── Green Banner ── */}
      <div className="acceptance-banner">
        <div className="success-icon-circle">✅</div>
        <div className="acceptance-title">Shipment Successfully Accepted</div>
        <div className="acceptance-sub">
          The AI Agent has successfully assigned this shipment.
        </div>
      </div>

      <div className="acceptance-body">
        {/* ── Summary Details ── */}
        <div className="section-title-inline">SHIPMENT DETAILS</div>
        <div className="data-grid">
          {[
            ['Shipment ID',       <span style={{ fontFamily: 'monospace' }}>{shipment.shipmentId}</span>],
            ['Organization',      shipment.organizationName],
            ['Source',            shipment.source],
            ['Destination',       shipment.destination],
            ['Vehicle Type',      shipment.vehicleType],
            ['Weight',            `${shipment.shipmentWeight} kg`],
            ['Distance',          `${shipment.distanceKm} km`],
            ['ETA',               `${shipment.averageETAHours} hrs`],
            ['Accepted Time',     shipment.acceptedAt],
            ['Shipment Status',   <span className="status-badge badge-accepted">Accepted</span>],
            ['Assignment Status', <span style={{ color: 'var(--success-color)', fontWeight: 700 }}>✓ Completed</span>],
            ['Driver Status',     <span style={{ color: 'var(--warning-color)', fontWeight: 700 }}>🟡 Ready for Pickup</span>],
          ].map(([lbl, val]) => (
            <div key={lbl} className="data-item">
              <div className="label">{lbl}</div>
              <div className="value">{val}</div>
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* ── AI Assignment Report ── */}
        <div className="ai-report-card">
          <div className="ai-report-header-row">
            <div>
              <div className="ai-report-title">AI Assignment Report</div>
              <div className="ai-report-sub">Recommendation analysis by SupplySync AI</div>
            </div>
            <div className="ai-report-badge">Agent Report</div>
          </div>

          <div className="ai-stats-row">
            <div className="ai-stat-item">
              <div className="ai-stat-label">Confidence</div>
              <div className="ai-stat-value" style={{ color: 'var(--accent-color)' }}>{confidence}%</div>
            </div>
            <div className="ai-stat-item">
              <div className="ai-stat-label">Org Rating</div>
              <div className="ai-stat-value" style={{ color: 'var(--warning-color)' }}>{shipment.organizationRating}/5</div>
            </div>
            <div className="ai-stat-item">
              <div className="ai-stat-label">Est. Arrival</div>
              <div className="ai-stat-value">{shipment.averageETAHours} hrs</div>
            </div>
            <div className="ai-stat-item">
              <div className="ai-stat-label">Decision Time</div>
              <div className="ai-stat-value" style={{ color: 'var(--secondary-color)' }}>1.2s</div>
            </div>
          </div>

          <div className="ai-reason-text">
            <strong style={{ color: 'var(--heading-color)' }}>Reason: </strong>
            Highest rated organization on the {shipment.source} → {shipment.destination} route with a rating of{' '}
            {shipment.organizationRating}/5. Selected based on organization reliability, availability, and shortest ETA.
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="btn-row" style={{ marginBottom: '2rem' }}>
          <button className="btn-secondary" onClick={onReset} style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
            🔍 Recommend Another Shipment
          </button>
        </div>

        <div className="divider" />

        {/* ── NEXT AGENT ── */}
        <div className="ai-report-card" style={{ marginTop: '2rem', border: '1px solid var(--accent-color)' }}>
          <div className="ai-report-header-row">
            <div>
              <div className="section-title-inline" style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>NEXT AGENT</div>
              <div className="ai-report-title" style={{ fontSize: '1.2rem' }}>Route Simulation Agent</div>
            </div>
            <div className="status-badge badge-accepted">Ready</div>
          </div>

          <div className="data-grid" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            {[
              ['Shipment ID', <span style={{ fontFamily: 'monospace' }}>{shipment.shipmentId}</span>],
              ['Distance', `${shipment.distanceKm} km`],
              ['Average ETA', `${shipment.averageETAHours} hrs`],
              ['Simulation Status', <span style={{ color: 'var(--muted-color)' }}>Not Started</span>],
            ].map(([lbl, val]) => (
              <div key={lbl} className="data-item">
                <div className="label">{lbl}</div>
                <div className="value">{val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span className="success-icon-circle" style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}>✓</span>
            <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>Ready for Simulation</span>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            onClick={() => window.location.href = `http://localhost:5177/?shipmentId=${shipment.shipmentId}`}
          >
            ▶️ Proceed to Route Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptanceSummary;
