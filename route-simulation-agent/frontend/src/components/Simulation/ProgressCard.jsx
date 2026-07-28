import React from 'react';
import { SIM_STATUS, STATUS_ORDER } from '../../constants/simulationStatus';

const ProgressCard = ({ progress, status, remainingDistance, remainingETA }) => {
  return (
    <div className="card" style={{ flexShrink: 0 }}>
      <div className="card-header">
        <div className="card-title">📈 Simulation Progress</div>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="progress-pct-display">{progress.toFixed(1)}%</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.5px' }}>OVERALL PROGRESS</div>
          </div>
          <div className="progress-stats" style={{ display: 'flex', gap: '0.75rem', marginTop: 0 }}>
            <div className="progress-stat" style={{ flex: '1 1 130px', minWidth: '130px' }}>
              <div className="progress-stat-label">Remaining Distance</div>
              <div className="progress-stat-value">{remainingDistance} km</div>
            </div>
            <div className="progress-stat" style={{ flex: '1 1 130px', minWidth: '130px' }}>
              <div className="progress-stat-label">Remaining ETA</div>
              <div className="progress-stat-value">{remainingETA}</div>
            </div>
          </div>
        </div>

        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="status-steps">
          {STATUS_ORDER.map((stepStatus, idx) => {
            const isCompleted = STATUS_ORDER.indexOf(status) > idx || status === SIM_STATUS.REACHED;
            const isActive = status === stepStatus && status !== SIM_STATUS.REACHED;
            
            return (
              <div key={stepStatus} className={`status-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                <div className="status-step-dot">{isActive ? '🔵' : isCompleted ? '✓' : ''}</div>
                {idx < STATUS_ORDER.length - 1 && <div className="status-step-line" />}
                <div className="status-step-label">{stepStatus}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
