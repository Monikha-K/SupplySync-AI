import React from 'react';

const getEventIcon = (eventName) => {
  const e = eventName.toLowerCase();
  if (e.includes('traffic')) return '🚦';
  if (e.includes('rain') || e.includes('weather')) return '⛈️';
  if (e.includes('road block') || e.includes('closure')) return '🚧';
  if (e.includes('breakdown')) return '🔧';
  return '⚠️';
};

const JourneyEvents = ({ events }) => {
  return (
    <div className="report-section">
      <div className="section-title">
        <span className="section-icon">🛣️</span>
        Journey Events
      </div>

      {!events || events.length === 0 ? (
        <div className="no-events">
          No incidents during journey.
        </div>
      ) : (
        <div className="events-list">
          {events.map((event, idx) => (
            <div key={idx} className="event-item">
              <span className="event-icon">{getEventIcon(event)}</span>
              <span className="event-label">{event}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JourneyEvents;
