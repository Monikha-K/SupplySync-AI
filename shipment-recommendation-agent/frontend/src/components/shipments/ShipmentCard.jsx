import React, { useState } from 'react';
import StarRating from '../common/StarRating';

const ShipmentCard = ({ shipment, onAccept }) => {
  const [state, setState] = useState('idle');

  const handleAccept = async () => {
    setState('accepting');
    try {
      await onAccept(shipment.shipmentId);
      setState('accepted');
    } catch {
      setState('idle');
    }
  };

  return (
    <div className="shipment-card">
      <div className="shipment-card-header">
        <div>
          <div className="shipment-card-org">{shipment.organizationName}</div>
          <div className="shipment-card-id">#{shipment.shipmentId}</div>
        </div>
        <div className="rating-display">
          <StarRating rating={shipment.organizationRating} />
          <span className="rating-num">{shipment.organizationRating}</span>
        </div>
      </div>

      <div className="shipment-card-meta">
        <div className="meta-item">
          <div className="meta-label">Distance</div>
          <div className="meta-value">{shipment.distanceKm} km</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">ETA</div>
          <div className="meta-value">{shipment.averageETAHours} hrs</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">Vehicle</div>
          <div className="meta-value">{shipment.vehicleType}</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">Weight</div>
          <div className="meta-value">{shipment.shipmentWeight} kg</div>
        </div>
      </div>

      {state === 'accepted' ? (
        <div className="accepted-chip">✅ Accepted</div>
      ) : (
        <button
          className="btn btn-outline btn-sm btn-full"
          onClick={handleAccept}
          disabled={state === 'accepting'}
        >
          {state === 'accepting' ? '⏳ Processing...' : 'Accept Shipment'}
        </button>
      )}
    </div>
  );
};

export default ShipmentCard;
