import React, { useState } from 'react';

const stars = r => {
  const full = Math.floor(r);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
};

const AI_REASONS = [
  '✓ Highest organization rating on this route',
  '✓ Shortest estimated delivery time',
  '✓ High customer reliability score',
  '✓ Available immediately for pickup',
];

const OtherCard = ({ shipment, onAccept }) => {
  const [state, setState] = useState('idle');

  const handle = async () => {
    setState('loading');
    try {
      await onAccept(shipment);
      setState('done');
    } catch {
      setState('idle');
    }
  };

  return (
    <div className="other-card">
      <div className="other-card-header">
        <div>
          <div className="other-card-org">{shipment.organizationName}</div>
          <div className="other-card-id">#{shipment.shipmentId}</div>
        </div>
        <div>
          <div className="other-card-stars">{stars(shipment.organizationRating)}</div>
          <div className="other-card-rating">{shipment.organizationRating} / 5</div>
        </div>
      </div>
      <div className="other-card-meta">
        <div className="meta-cell">
          <div className="meta-label">Distance</div>
          <div className="meta-value">{shipment.distanceKm} km</div>
        </div>
        <div className="meta-cell">
          <div className="meta-label">ETA</div>
          <div className="meta-value">{shipment.averageETAHours} hrs</div>
        </div>
        <div className="meta-cell">
          <div className="meta-label">Vehicle</div>
          <div className="meta-value">{shipment.vehicleType}</div>
        </div>
        <div className="meta-cell">
          <div className="meta-label">Weight</div>
          <div className="meta-value">{shipment.shipmentWeight} kg</div>
        </div>
      </div>
      {state === 'done' ? (
        <div className="accepted-inline">✅ Accepted</div>
      ) : (
        <button className="other-accept-btn" onClick={handle} disabled={state === 'loading'}>
          {state === 'loading' ? 'Processing...' : 'Accept Shipment'}
        </button>
      )}
    </div>
  );
};

const RecommendationResult = ({ recommendedShipment, otherShipments, onAccept, onReset }) => {
  const [accepting, setAccepting] = useState(false);

  const handleMainAccept = async () => {
    setAccepting(true);
    try {
      await onAccept(recommendedShipment);
    } catch {
      setAccepting(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── Recommended Card ── */}
      {recommendedShipment ? (
        <div className="recommendation-card">
          <div className="rec-banner">
            <span className="rec-badge">⭐ AI Recommended</span>
            <span className="rec-rating-pill">★ {recommendedShipment.organizationRating} / 5.0</span>
          </div>

          <div className="rec-body">
            <div className="rec-org-row">
              <div>
                <div className="rec-org-name">{recommendedShipment.organizationName}</div>
                <div className="rec-id">#{recommendedShipment.shipmentId}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="rec-stars">{stars(recommendedShipment.organizationRating)}</div>
                <div className="rec-rating-label">{recommendedShipment.organizationRating} / 5</div>
              </div>
            </div>

            <div className="data-grid">
              <div className="data-item">
                <div className="label">Source</div>
                <div className="value">{recommendedShipment.source}</div>
              </div>
              <div className="data-item">
                <div className="label">Destination</div>
                <div className="value">{recommendedShipment.destination}</div>
              </div>
              <div className="data-item">
                <div className="label">Distance</div>
                <div className="value">{recommendedShipment.distanceKm} km</div>
              </div>
              <div className="data-item">
                <div className="label">Avg. ETA</div>
                <div className="value">{recommendedShipment.averageETAHours} hrs</div>
              </div>
              <div className="data-item">
                <div className="label">Vehicle Type</div>
                <div className="value">{recommendedShipment.vehicleType}</div>
              </div>
              <div className="data-item">
                <div className="label">Weight</div>
                <div className="value">{recommendedShipment.shipmentWeight} kg</div>
              </div>
              <div className="data-item">
                <div className="label">Status</div>
                <div className="value">
                  <span className="status-badge badge-available">● Available</span>
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="ai-reasoning-box">
              <div className="ai-reasoning-title">🧠 Why this shipment was selected</div>
              <ul className="ai-reason-list">
                {AI_REASONS.map((r, i) => (
                  <li key={i} className="ai-reason-item">
                    <span className="ai-reason-icon">✓</span>
                    {r.replace('✓ ', '')}
                  </li>
                ))}
              </ul>
            </div>

            <button
              id="accept-recommended-btn"
              className="btn-success"
              onClick={handleMainAccept}
              disabled={accepting}
            >
              {accepting ? 'Processing...' : 'Accept Shipment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="selection-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No Shipments Available</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--muted-text)' }}>
            No available shipments found for this route.
          </p>
          <button className="btn-secondary" onClick={onReset}>Try Another Route</button>
        </div>
      )}

      {/* ── Other Shipments ── */}
      {otherShipments.length > 0 && (
        <div className="other-section">
          <div className="section-title">Other Available Organizations ({otherShipments.length})</div>
          <div className="other-cards-grid">
            {otherShipments.map(s => (
              <OtherCard key={s.shipmentId} shipment={s} onAccept={onAccept} />
            ))}
          </div>
        </div>
      )}

      <div className="btn-row" style={{ marginTop: '2rem' }}>
        <button className="btn-secondary" onClick={onReset}>← Search Another Route</button>
      </div>
    </div>
  );
};

export default RecommendationResult;
