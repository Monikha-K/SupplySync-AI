const DriverCard = ({ driver, reason }) => {
  if (!driver) return null;

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

    </div>
  );
};

export default DriverCard;