import React, { useState } from 'react';
import StarRating from '../common/StarRating';

const SuccessPanel = ({ shipment, acceptedAt }) => (
  <div className="success-panel">
    <div className="success-banner">
      <div className="success-check-circle">✅</div>
      <div className="success-banner-title">Shipment Accepted Successfully!</div>
      <div className="success-banner-sub">
        Your shipment has been confirmed and is now in <strong>Accepted</strong> status.
      </div>
    </div>

    <div className="success-body">
      <div className="success-details-grid">
        {[
          ['Shipment ID',       <span style={{ fontFamily:'monospace' }}>{shipment.shipmentId}</span>],
          ['Organization',      shipment.organizationName],
          ['Rating',            `⭐ ${shipment.organizationRating} / 5`],
          ['Driver Status',     <span className="status-badge status-accepted">✓ Accepted</span>],
          ['Source',            `📍 ${shipment.source}`],
          ['Destination',       `🏁 ${shipment.destination}`],
          ['Distance',          `${shipment.distanceKm} km`],
          ['Estimated Travel',  `${shipment.averageETAHours} hrs`],
          ['Vehicle Type',      shipment.vehicleType],
          ['Shipment Weight',   `${shipment.shipmentWeight} kg`],
          ['Acceptance Time',   acceptedAt],
          ['Current Status',    <span className="status-badge status-accepted">Accepted</span>],
        ].map(([label, value]) => (
          <div key={label} className="detail-item">
            <div className="detail-label">{label}</div>
            <div className="detail-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div className="success-actions">
        <button className="btn btn-outline btn-sm">📋 View Shipment Details</button>
        <button className="btn btn-outline btn-sm">📡 Shipment Monitoring</button>
        <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
          🔍 Find Another Shipment
        </button>
      </div>
    </div>
  </div>
);

const RecommendedShipment = ({ shipment, onAccept }) => {
  const [state, setState] = useState('idle'); // idle | accepting | accepted
  const [acceptedAt, setAcceptedAt] = useState(null);

  const handleAccept = async () => {
    setState('accepting');
    try {
      await onAccept(shipment.shipmentId);
      setAcceptedAt(new Date().toLocaleString('en-IN'));
      setState('accepted');
    } catch {
      setState('idle');
    }
  };

  if (state === 'accepted') {
    return <SuccessPanel shipment={shipment} acceptedAt={acceptedAt} />;
  }

  return (
    <div className="recommended-card">
      <div className="recommended-banner">
        <span className="recommended-badge">⭐ AI Recommended</span>
        <span className="recommended-rating-badge">
          ★ {shipment.organizationRating} / 5.0
        </span>
      </div>

      <div className="recommended-body">
        <div className="shipment-org-row">
          <div>
            <div className="shipment-org-name">{shipment.organizationName}</div>
            <div className="shipment-id-tag">#{shipment.shipmentId}</div>
          </div>
          <div className="rating-display">
            <StarRating rating={shipment.organizationRating} />
            <span className="rating-num">{shipment.organizationRating} / 5</span>
          </div>
        </div>

        <div className="shipment-details-grid">
          {[
            ['Source',         `📍 ${shipment.source}`],
            ['Destination',    `🏁 ${shipment.destination}`],
            ['Distance',       `${shipment.distanceKm} km`],
            ['Avg. ETA',       `${shipment.averageETAHours} hrs`],
            ['Vehicle Type',   shipment.vehicleType],
            ['Weight',         `${shipment.shipmentWeight} kg`],
            ['Status',         <span className="status-badge status-available">● Available</span>],
          ].map(([label, value]) => (
            <div key={label} className="detail-item">
              <div className="detail-label">{label}</div>
              <div className="detail-value">{value}</div>
            </div>
          ))}
        </div>

        <button
          id="accept-recommended-btn"
          className="btn btn-success btn-full btn-lg"
          onClick={handleAccept}
          disabled={state === 'accepting'}
        >
          {state === 'accepting' ? '⏳ Processing...' : '✓ Accept This Shipment'}
        </button>
      </div>
    </div>
  );
};

export default RecommendedShipment;
