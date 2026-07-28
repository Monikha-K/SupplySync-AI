import React from 'react';

const RecommendationCard = ({ recommendations }) => {
  return (
    <div className="report-section">
      <div className="section-title">
        <span className="section-icon">🤖</span>
        AI Logistics Recommendations
      </div>

      {!recommendations || recommendations.length === 0 ? (
        <div className="no-events">
          No recommendations available at this time.
        </div>
      ) : (
        <div className="recommendations-list">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="recommendation-item">
              <span className="recommendation-check">✓</span>
              <span className="recommendation-text">{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;
