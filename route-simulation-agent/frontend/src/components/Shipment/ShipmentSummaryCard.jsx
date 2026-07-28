import React from 'react';
import StatusChip from '../common/StatusChip';
import { getStatusIcon } from '../../utils/statusManager';

const ShipmentSummaryCard = ({ shipment, currentStatus }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">📦 Shipment Details</div>
        <StatusChip 
          status={currentStatus} 
          icon={getStatusIcon(currentStatus)} 
        />
      </div>
      <div className="card-body">
        <div className="data-grid">
          <div className="data-item">
            <div className="data-label">Shipment ID</div>
            <div className="data-value" style={{ fontFamily: 'monospace' }}>{shipment.shipmentId}</div>
          </div>
          <div className="data-item">
            <div className="data-label">Organization</div>
            <div className="data-value">{shipment.organizationName}</div>
          </div>
          <div className="data-item">
            <div className="data-label">Source</div>
            <div className="data-value">{shipment.source}</div>
          </div>
          <div className="data-item">
            <div className="data-label">Destination</div>
            <div className="data-value">{shipment.destination}</div>
          </div>
          <div className="data-item">
            <div className="data-label">Distance</div>
            <div className="data-value">{shipment.distanceKm} km</div>
          </div>
          <div className="data-item">
            <div className="data-label">Average ETA</div>
            <div className="data-value">{shipment.averageETAHours} hrs</div>
          </div>
          <div className="data-item">
            <div className="data-label">Vehicle Type</div>
            <div className="data-value">{shipment.vehicleType}</div>
          </div>
          <div className="data-item">
            <div className="data-label">Weight</div>
            <div className="data-value">{shipment.shipmentWeight} kg</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentSummaryCard;
