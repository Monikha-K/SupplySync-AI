import React from 'react';
import { calcElapsedTime } from '../../utils/etaCalculator';

const CompletionCard = ({ shipment, startTime, simState }) => {
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

      <div className="completion-success-message" style={{
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        border: '1px solid #10B981',
        borderRadius: '8px',
        padding: '1rem',
        margin: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ color: '#10B981', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
          Simulation Completed Successfully
        </div>
        <div style={{ color: 'var(--text, #E5E7EB)', fontSize: '0.9rem' }}>
          Simulation data has been saved successfully.
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
          {simState?.performanceScore !== undefined && (
            <div className="completion-stat">
              <div className="completion-stat-label">Performance Score</div>
              <div className="completion-stat-value" style={{ color: '#10B981', fontWeight: 700 }}>
                {simState.performanceScore}/100
              </div>
            </div>
          )}
          {simState?.delayMinutes !== undefined && (
            <div className="completion-stat">
              <div className="completion-stat-label">Delay Minutes</div>
              <div className="completion-stat-value">
                {simState.delayMinutes} m
              </div>
            </div>
          )}
          <div className="completion-stat">
            <div className="completion-stat-label">Final Status</div>
            <div className="completion-stat-value" style={{ color: 'var(--success)' }}>✅ Completed</div>
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
