export default function SimulationFeed({ logs, isLive }) {
  return (
    <div className="section-card" id="simFeedCard">
      <div className="section-header">
        <div className="section-title">
          <span>📡</span> Live Agent Telemetry Feed
        </div>
        {isLive && (
          <span className="section-badge live">● LIVE CONNECTED</span>
        )}
      </div>
      <div className="sim-log-list">
        {logs.map((log, idx) => (
          <div key={idx} className="sim-log-entry">{log}</div>
        ))}
      </div>
    </div>
  );
}
