import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompletedShipmentCard = ({ shipment }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="shipment-card">
      <div className="card-header">
        <span className="card-shipment-id">{shipment.shipmentId}</span>
        <span className="status-badge status-completed">
          <span>●</span> {shipment.status}
        </span>
      </div>

      <div className="card-org">{shipment.organizationName}</div>

      <div className="card-route">
        <span>{shipment.source}</span>
        <span className="route-arrow">→</span>
        <span>{shipment.destination}</span>
      </div>

      <div className="card-date">
        Completed: {formatDate(shipment.completedAt)}
      </div>

      <div className="card-footer">
        <button
          className="btn btn-primary btn-full"
          onClick={() => navigate(`/report/${shipment.shipmentId}`)}
        >
          📊 Generate Insights
        </button>
      </div>
    </div>
  );
};

export default CompletedShipmentCard;
