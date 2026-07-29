import "../styles/RouteProgress.css";
import "../styles/Cards.css";

function RouteProgress({ pickup, currentLocation, destination }) {
  // Determine progress: 0 = at pickup, 50 = in transit, 100 = arrived
  const atPickup      = currentLocation === pickup;
  const atDestination = currentLocation === destination;
  const progress      = atDestination ? 100 : atPickup ? 0 : 50;

  const nodes = [
    { label: pickup,          key: "pickup",   done: true,  active: atPickup },
    { label: currentLocation, key: "current",  done: !atPickup, active: !atPickup && !atDestination },
    { label: destination,     key: "dest",     done: atDestination, active: atDestination },
  ];

  return (
    <div className="route-progress-wrapper">
      <div className="route-progress-card">
        <div className="card-header">
          <span className="card-icon">🗺️</span>
          <h2>Route Progress</h2>
        </div>

        <div className="route-track">
          <div className="route-line" />
          <div className="route-line-filled" style={{ width: `${progress}%` }} />

          {/* Truck icon positioned along the line */}
          <div
            className="truck-icon"
            style={{ left: `calc(${progress}% - 11px)` }}
          >
            🚚
          </div>

          {nodes.map(({ label, key, done, active }) => (
            <div className="route-node" key={key}>
              <div className={`node-dot ${active ? "active" : done ? "done" : ""}`} />
              {active && <span className="node-tag">Current</span>}
              <span className={`node-label ${active ? "active" : done ? "done" : ""}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RouteProgress;
