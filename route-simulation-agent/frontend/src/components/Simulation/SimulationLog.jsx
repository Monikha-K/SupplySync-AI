import React, { useEffect, useRef } from 'react';

const SimulationLog = ({ timeline }) => {
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new log
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [timeline]);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '260px' }}>
      <div className="card-header">
        <div className="card-title">📝 Simulation Log</div>
      </div>
      <div className="card-body" style={{ flex: 1, paddingRight: '0.5rem', overflow: 'hidden' }}>
        <div className="timeline" ref={containerRef}>
          {timeline.length === 0 ? (
            <div className="timeline-empty">No events yet. Start the simulation.</div>
          ) : (
            timeline.map((item, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-icon">{item.icon}</div>
                <div className="timeline-body">
                  <div className="timeline-time">{item.time}</div>
                  <div className="timeline-msg">{item.message}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationLog;
