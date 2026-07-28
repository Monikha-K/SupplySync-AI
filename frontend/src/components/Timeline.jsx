export default function Timeline({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="section-card">
        <div className="section-title"><span>📍</span> Journey Timeline</div>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>No timeline checkpoints available.</p>
      </div>
    );
  }

  function getIconSymbol(status) {
    if (status === 'completed') return '✓';
    if (status === 'current') return '●';
    if (status === 'destination') return '🏁';
    return '○';
  }

  function getTagLabel(status) {
    if (status === 'completed') return 'Completed';
    if (status === 'current') return 'Current Location';
    if (status === 'destination') return 'Destination';
    return 'Upcoming';
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title">
          <span>📍</span> Delivery Journey Timeline
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time Checkpoint Telemetry</span>
      </div>

      <div className="timeline-container">
        {timeline.map((item, idx) => (
          <div key={idx} className={`timeline-item ${item.status}`}>
            <div className="timeline-marker">{getIconSymbol(item.status)}</div>
            <div className="timeline-content">
              <div className="timeline-location-name">
                <span>📍 {item.location}</span>
              </div>
              <div className="timeline-status-tag">{getTagLabel(item.status)}</div>
              {item.note && <div className="timeline-note">{item.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
