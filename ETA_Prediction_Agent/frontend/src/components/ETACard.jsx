import "../styles/Cards.css";
import { getTrafficBadge, getWeatherBadge } from "./badgeHelpers";

function ETACard({ eta, shipment }) {
  return (
    <div className="glass-card">
      <div className="card-header">
        <span className="card-icon">⏱️</span>
        <h2>ETA Prediction</h2>
      </div>
      <div className="eta-time">
        <div className="eta-number">{eta.formatted}</div>
        <div className="eta-label">Estimated Arrival Time</div>
      </div>
      <div className="eta-badges">
        <span className={`badge ${getTrafficBadge(shipment.traffic)}`}>
          🚦 {shipment.traffic} Traffic
        </span>
        <span className={`badge ${getWeatherBadge(shipment.weather)}`}>
          🌤 {shipment.weather}
        </span>
      </div>
    </div>
  );
}

export default ETACard;
