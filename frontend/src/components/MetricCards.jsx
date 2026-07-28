export default function MetricCards({ shipment }) {
  const { status, statusColor, currentLocation, eta, progress } = shipment;

  const statusEmoji = status === 'In Transit' ? '🟢 '
    : status === 'Delayed' ? '🟡 '
    : status === 'Delivered' ? '✅ '
    : '📦 ';

  const badgeClass = statusColor === 'warning' ? 'metric-status-badge warning' : 'metric-status-badge success';

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-title">Shipment Status</div>
        <div className="metric-value">
          <span className={badgeClass}>{statusEmoji}{status}</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-title">Current Location</div>
        <div className="metric-value" style={{ fontSize: '1.1rem' }}>{currentLocation}</div>
      </div>

      <div className="metric-card">
        <div className="metric-title">ETA</div>
        <div className="metric-value">{eta}</div>
      </div>

      <div className="metric-card">
        <div className="metric-title">Progress</div>
        <div className="metric-value" style={{ color: 'var(--success)' }}>{progress}%</div>
      </div>
    </div>
  );
}
