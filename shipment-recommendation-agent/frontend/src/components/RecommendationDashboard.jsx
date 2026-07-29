import React from 'react';
import ShipmentComparisonTable from './ShipmentComparisonTable';
import RecommendationScoreCard from './RecommendationScoreCard';
import './RecommendationDashboard.css';

const RecommendationDashboard = ({ data, onAccept, onReset }) => {
  const { totalShipments, eligibleShipments, rejectedShipments, recommendedShipment, otherShipments, rejectedDetails } = data;

  return (
    <div className="recommendation-dashboard">
      <header className="dashboard-header">
        <h2 className="dashboard-title">Recommendation Analysis Complete</h2>
        <div className="dashboard-actions">
          <button className="btn-secondary" onClick={onReset}>Start New Search</button>
        </div>
      </header>

      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Analyzed</span>
          <span className="stat-value">{totalShipments}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Eligible</span>
          <span className="stat-value text-success">{eligibleShipments}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Rejected</span>
          <span className="stat-value text-error">{rejectedShipments}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Compared</span>
          <span className="stat-value text-primary">{otherShipments.length + (recommendedShipment ? 1 : 0)}</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="main-content">
          {recommendedShipment ? (
            <RecommendationScoreCard shipment={recommendedShipment} onAccept={() => onAccept(recommendedShipment)} />
          ) : (
            <div className="no-recommendation">No eligible shipments found for this route.</div>
          )}
        </div>
        <div className="side-content">
          <ShipmentComparisonTable 
            recommended={recommendedShipment} 
            others={otherShipments} 
            rejected={rejectedDetails} 
          />
        </div>
      </div>
    </div>
  );
};

export default RecommendationDashboard;
