import React from 'react';
import './RecommendationScoreCard.css';

const RecommendationScoreCard = ({ shipment, onAccept }) => {
  const { recommendationScore = 0, confidenceScore = 0, decisionReasons = [] } = shipment;
  
  // Circular progress math
  const scoreCircumference = 2 * Math.PI * 45; // r=45
  const scoreOffset = scoreCircumference - (recommendationScore / 100) * scoreCircumference;

  return (
    <div className="score-card">
      <div className="score-header">
        <div className="org-info">
          <h3>{shipment.organizationName}</h3>
          <span className="shipment-id-badge">{shipment.shipmentId}</span>
        </div>
        <div className="rating-pill">⭐ {shipment.organizationRating} / 5.0</div>
      </div>

      <div className="score-metrics-container">
        <div className="circular-progress-container">
          <svg className="circular-progress" width="120" height="120" viewBox="0 0 100 100">
            <circle className="circle-bg" cx="50" cy="50" r="45" />
            <circle 
              className="circle-path" 
              cx="50" cy="50" r="45" 
              strokeDasharray={scoreCircumference}
              strokeDashoffset={scoreOffset}
            />
          </svg>
          <div className="circular-text">
            <span className="score-val">{recommendationScore}%</span>
            <span className="score-lbl">Score</span>
          </div>
        </div>

        <div className="confidence-container">
          <div className="conf-header">
            <span>AI Confidence</span>
            <span className="conf-val">{confidenceScore}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${confidenceScore}%` }}></div>
          </div>
        </div>
      </div>

      <div className="shipment-details-grid">
        <div className="detail-item">
          <span className="detail-label">Distance</span>
          <span className="detail-value">{shipment.distanceKm} km</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Weight</span>
          <span className="detail-value">{shipment.shipmentWeight} kg</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Vehicle</span>
          <span className="detail-value">{shipment.vehicleType}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">ETA</span>
          <span className="detail-value">{shipment.averageETAHours} hrs</span>
        </div>
      </div>

      <div className="decision-reasons">
        <h4>Decision Reasons</h4>
        <ul>
          {decisionReasons.map((reason, idx) => (
            <li key={idx}>✓ {reason}</li>
          ))}
        </ul>
      </div>

      <button className="btn-accept-recommendation" onClick={onAccept}>
        Accept Recommendation
      </button>
    </div>
  );
};

export default RecommendationScoreCard;
