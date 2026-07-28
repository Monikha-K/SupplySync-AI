import React from 'react';
import StatusChip from './common/StatusChip';

const AcceptedShipmentCard = ({ shipment, onGenerate }) => {
  return (
    <div className="card" style={{ marginBottom: '1rem', animation: 'fadeUp 0.3s ease' }}>
      <div className="card-header">
        <div className="card-title">
          <span style={{ fontFamily: 'monospace' }}>#{shipment.shipmentId}</span>
          <span style={{ margin: '0 0.5rem', color: 'var(--muted)' }}>|</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{shipment.organizationName}</span>
        </div>
        <StatusChip status="Accepted" icon="📋" />
      </div>
      <div className="card-body">
        <div className="data-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="data-item">
            <div className="data-label">Route</div>
            <div className="data-value">{shipment.source} → {shipment.destination}</div>
          </div>
          <div className="data-item">
            <div className="data-label">Distance</div>
            <div className="data-value">{shipment.distanceKm} km</div>
          </div>
          <div className="data-item">
            <div className="data-label">Avg ETA</div>
            <div className="data-value">{shipment.averageETAHours} hrs</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => onGenerate(shipment.shipmentId)}>
            ⚡ Generate Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptedShipmentCard;
