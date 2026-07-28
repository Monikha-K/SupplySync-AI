import React from 'react';
import { SIM_EVENTS, SPEED_MULTIPLIERS } from '../../constants/simulationEvents';

const SimulationControls = ({
  simulationRunning,
  simulationPaused,
  simulationSpeed,
  activeEvent,
  progress,
  onStart,
  onPause,
  onResume,
  onReset,
  onSetSpeed,
  onTriggerEvent
}) => {
  const isFinished = progress >= 100;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">⚙️ Simulation Controls</div>
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Core Controls */}
        <div className="controls-row">
          {!simulationRunning && !isFinished ? (
            <button className="btn btn-primary" onClick={onStart}>🚀 Start Simulation</button>
          ) : (
            <>
              {simulationPaused ? (
                <button className="btn btn-primary" onClick={onResume} disabled={isFinished}>▶️ Resume</button>
              ) : (
                <button className="btn btn-secondary" onClick={onPause} disabled={!simulationRunning || isFinished}>⏸️ Pause</button>
              )}
            </>
          )}
          <button className="btn btn-secondary" onClick={onReset}>🔄 Reset</button>

          <div className="controls-divider" />

          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Speed</div>
          <div className="speed-group">
            {Object.keys(SPEED_MULTIPLIERS).map(spd => (
              <button
                key={spd}
                className={`speed-btn ${simulationSpeed === spd ? 'active' : ''}`}
                onClick={() => onSetSpeed(spd)}
              >
                {spd}
              </button>
            ))}
          </div>
        </div>

        {/* Event Triggers */}
        <div>
          <div className="events-label" style={{ marginBottom: '0.5rem' }}>Manual Simulation Events</div>
          <div className="events-row">
            {Object.values(SIM_EVENTS).map(ev => (
              <button
                key={ev.id}
                className={`event-btn ${activeEvent === ev.id ? 'active' : ''}`}
                onClick={() => onTriggerEvent(ev.id)}
                disabled={activeEvent === ev.id || !simulationRunning || simulationPaused || isFinished}
              >
                <span>{ev.icon}</span> {ev.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Event Alert */}
        {activeEvent && SIM_EVENTS[activeEvent] && (
          <div className="active-event-alert">
            <div className="alert-icon">{SIM_EVENTS[activeEvent].icon}</div>
            <div className="alert-text">{SIM_EVENTS[activeEvent].description}</div>
            <div className="alert-badge">Event Active</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationControls;
