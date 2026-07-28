import React from 'react';

const getStrategyDetails = (mode) => {
  switch(mode) {
    case 'Heavy Traffic':
      return {
        reason: 'Peak-hour traffic simulation selected by user.',
        impact: 'ETA may increase by approximately 15%.',
      };
    case 'Heavy Rain':
      return {
        reason: 'Adverse weather simulation selected by user.',
        impact: 'Vehicle speed will decrease by 30%.',
      };
    case 'Road Block':
      return {
        reason: 'Unexpected road closure simulation selected by user.',
        impact: 'Simulation will pause to reroute automatically.',
      };
    case 'Vehicle Breakdown':
      return {
        reason: 'Critical vehicle failure simulation selected by user.',
        impact: 'Simulation will pause for emergency repair.',
      };
    case 'Normal Journey':
    default:
      return {
        reason: 'Standard journey simulation selected by user.',
        impact: 'No negative impacts expected on route.',
      };
  }
};

const AISimulationStrategy = ({ simulationMode }) => {
  const details = getStrategyDetails(simulationMode);

  return (
    <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--accent)' }}>
      <div className="card-header">
        <div className="card-title" style={{ color: 'var(--accent)' }}>🧠 AI Simulation Strategy</div>
      </div>
      <div className="card-body">
        
        <div className="data-grid">
          <div className="data-item">
            <div className="label">Simulation Type</div>
            <div className="value" style={{ fontWeight: 600 }}>{simulationMode}</div>
          </div>
          <div className="data-item">
            <div className="label">Confidence</div>
            <div className="value" style={{ color: 'var(--success)', fontWeight: 600 }}>100%</div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ color: 'var(--heading)', fontWeight: 600 }}>Reason: </span>
            <span style={{ color: 'var(--text)' }}>{details.reason}</span>
          </div>
          <div>
            <span style={{ color: 'var(--heading)', fontWeight: 600 }}>Expected Impact: </span>
            <span style={{ color: 'var(--text)' }}>{details.impact}</span>
          </div>
        </div>
        
        <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--warning)', color: 'var(--text)', fontSize: '0.85rem' }}>
          <strong>NOTE:</strong> This is NOT a prediction. It only explains how the simulation logic will execute based on configuration.
        </div>

      </div>
    </div>
  );
};

export default AISimulationStrategy;
