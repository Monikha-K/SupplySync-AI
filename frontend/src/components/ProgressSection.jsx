import { useEffect, useRef } from 'react';

export default function ProgressSection({ shipment }) {
  const fillRef = useRef(null);

  useEffect(() => {
    // Animate progress bar on mount and update
    const el = fillRef.current;
    if (!el) return;
    el.style.width = '0%';
    const t = setTimeout(() => {
      el.style.width = `${shipment.progress}%`;
    }, 100);
    return () => clearTimeout(t);
  }, [shipment.progress]);

  const { progress, telemetry } = shipment;

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title">
          <span>📊</span> Progress Bar &amp; Live Telemetry
        </div>
        <div className="progress-value-text">{progress}%</div>
      </div>

      <div className="progress-bar-track">
        <div className="progress-bar-fill" ref={fillRef} style={{ width: `${progress}%` }} />
      </div>

      {telemetry && (
        <div className="progress-telemetry-row">
          <span>Speed: <strong className="telemetry-val">{telemetry.speed}</strong></span>
          <span>Temp: <strong className="telemetry-val">{telemetry.temperature}</strong></span>
          <span>
            Distance: <strong className="telemetry-val">
              {telemetry.distanceCovered} / {telemetry.totalDistance}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}
