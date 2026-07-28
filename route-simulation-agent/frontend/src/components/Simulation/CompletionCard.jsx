import React from 'react';
import { calcElapsedTime } from '../../utils/etaCalculator';

const CompletionCard = ({ shipment, startTime }) => {
  const totalTime = calcElapsedTime(startTime);

  return (
    <div className="completion-card">
      <div className="completion-banner">
        <div className="completion-icon-circle">🏁</div>
        <div className="completion-title">Simulation Completed</div>
        <div className="completion-sub">
          The shipment has reached its destination.
        </div>
      </div>
      <div className="completion-body">
        <div className="section-sub-title">SIMULATION RESULTS</div>
        <div className="completion-stats">
          <div className="completion-stat">
            <div className="completion-stat-label">Shipment ID</div>
            <div className="completion-stat-value" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {shipment.shipmentId}
            </div>
          </div>
          <div className="completion-stat">
            <div className="completion-stat-label">Organization</div>
            <div className="completion-stat-value">{shipment.organizationName}</div>
          </div>
          <div className="completion-stat">
            <div className="completion-stat-label">Distance Covered</div>
            <div className="completion-stat-value">{shipment.distanceKm} km</div>
          </div>
          <div className="completion-stat">
            <div className="completion-stat-label">Total Sim Time</div>
            <div className="completion-stat-value">{totalTime}</div>
          </div>
          <div className="completion-stat">
            <div className="completion-stat-label">Final Status</div>
            <div className="completion-stat-value" style={{ color: 'var(--success)' }}>✅ Reached</div>
          </div>
        </div>

        <div className="divider" />

        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Proceed to Risk Prediction Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionCard;
