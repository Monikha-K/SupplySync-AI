import "../styles/Cards.css";
import { getTrafficBadge, getWeatherBadge } from "./badgeHelpers";

function ShipmentCard({ shipment }) {
  const rows = [
    { label: "Shipment ID",       value: shipment.shipmentId },
    { label: "Pickup",            value: shipment.pickup },
    { label: "Current Location",  value: shipment.currentLocation },
    { label: "Destination",       value: shipment.destination },
    { label: "Traffic",           value: <span className={`badge ${getTrafficBadge(shipment.traffic)}`}>{shipment.traffic}</span> },
    { label: "Weather",           value: <span className={`badge ${getWeatherBadge(shipment.weather)}`}>{shipment.weather}</span> },
    { label: "Status",            value: shipment.status },
  ];

  return (
    <div className="glass-card">
      <div className="card-header">
        <span className="card-icon">📦</span>
        <h2>Shipment Details</h2>
      </div>
      {rows.map(({ label, value }) => (
        <div className="detail-row" key={label}>
          <span className="detail-label">{label}</span>
          <span className="detail-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

export default ShipmentCard;
