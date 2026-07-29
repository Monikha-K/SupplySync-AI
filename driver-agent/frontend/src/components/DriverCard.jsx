import { useState } from "react";
import { assignDriver } from "../services/api";

const DriverCard = ({ driver, reason, shipment, assigned, onAssigned }) => {
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  if (!driver) return null;

  const handleAssign = async () => {
    setAssigning(true);
    setError("");
    try {
      const res = await assignDriver({
        driver_id: driver.driver_id,
        driver_name: driver.name,
        pickup_city: shipment.pickup_city,
        drop_city: shipment.delivery_city,
        cargo_type: shipment.cargo_type,
        weight: shipment.weight_kg,
        priority: shipment.priority,
        recommendation_reason: reason,
      });
      onAssigned({
        shipment_id: res.data.shipment_id,
        driver_id: driver.driver_id,
        driver_name: driver.name,
        pickup_city: shipment.pickup_city,
        drop_city: shipment.delivery_city,
        cargo_type: shipment.cargo_type,
        weight: shipment.weight_kg,
        priority: shipment.priority,
        assigned_at: new Date().toLocaleString(),
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Assignment failed. Please try again.");
    }
    setAssigning(false);
  };

  return (
    <div className="driver-card">

      <div className="driver-header">
        <div className="trophy">🏆</div>
        <div>
          <h2>{driver.name}</h2>
          <p>{driver.driver_id}</p>
        </div>
      </div>

      <div className="driver-details">
        <div className="detail-box">
          <span>🚛 Vehicle</span>
          <strong>{driver.vehicle_type}</strong>
        </div>
        <div className="detail-box">
          <span>⭐ Score</span>
          <strong>{driver.recommendation_score}</strong>
        </div>
        <div className="detail-box">
          <span>⭐ Rating</span>
          <strong>{driver.overall_rating}</strong>
        </div>
        <div className="detail-box">
          <span>📦 Capacity</span>
          <strong>{driver.capacity_kg} kg</strong>
        </div>
        <div className="detail-box">
          <span>🛡 Safety</span>
          <strong>{driver.safety_score}</strong>
        </div>
        <div className="detail-box">
          <span>💼 Experience</span>
          <strong>{driver.experience_years} Years</strong>
        </div>
      </div>

      <div className="ai-reason">
        <h3>🤖 AI Recommendation</h3>
        <p>{reason}</p>
      </div>

      <button
        className={assigned ? "btn-assigned" : "btn-accept"}
        onClick={handleAssign}
        disabled={assigned || assigning}
      >
        {assigning ? "Assigning..." : assigned ? "✅ Driver Accepted" : "✔ Accept Driver"}
      </button>

      {error && <div className="assignment-error">{error}</div>}

    </div>
  );
};

export default DriverCard;