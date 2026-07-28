import React from 'react';
import { SIM_STATUS, STATUS_ORDER } from '../../constants/simulationStatus';

const ProgressCard = ({ progress, status, remainingDistance, remainingETA }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">📈 Simulation Progress</div>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="progress-pct-display">{progress.toFixed(1)}%</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>OVERALL PROGRESS</div>
          </div>
          <div className="progress-stats">
            <div className="progress-stat">
              <div className="progress-stat-label">Remaining Distance</div>
              <div className="progress-stat-value">{remainingDistance} km</div>
            </div>
            <div className="progress-stat">
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
