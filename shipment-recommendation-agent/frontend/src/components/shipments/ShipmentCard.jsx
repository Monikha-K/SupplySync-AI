import React from 'react';
import RecommendedBadge from './RecommendedBadge';
import { formatDistance, formatRating } from '../../utils/formatters';

const ShipmentCard = ({ shipment, isRecommended, onAccept }) => {
  if (isRecommended) {
    return (
      <div className="recommended-card">
        <RecommendedBadge />
        <div className="card-header">
          <div className="card-header-info">
            <h3>{shipment.organizationName}</h3>
            <span className="shipment-id-text">ID: {shipment.shipmentId}</span>
          </div>
          <div className="rating-badge">
            ⭐ {formatRating(shipment.rating)}
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Distance</span>
            <span className="detail-value">{formatDistance(shipment.distance)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Average ETA</span>
            <span className="detail-value">{shipment.averageEta}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Organization Rating</span>
            <span className="detail-value">⭐ {formatRating(shipment.rating)} / 5.0</span>
          </div>
        </div>

        <button
          className="btn-accept-lg"
          onClick={() => onAccept(shipment.shipmentId)}
        >
          ✓ Accept This Shipment
        </button>
      </div>
    );
  }

  return (
    <div className="shipment-list-card">
      <div className="card-row">
        <div className="card-row-info">
          <h4>{shipment.organizationName}</h4>
          <p>ID: {shipment.shipmentId}</p>
          <div className="meta-row">
            <div className="meta-item">
              <span className="detail-label">Rating</span>
              <span className="detail-value">⭐ {formatRating(shipment.rating)}</span>
            </div>
            <div className="meta-item">
              <span className="detail-label">Distance</span>
              <span className="detail-value">{formatDistance(shipment.distance)}</span>
            </div>
            <div className="meta-item">
              <span className="detail-label">ETA</span>
              <span className="detail-value">{shipment.averageEta}</span>
            </div>
          </div>
        </div>
        <button
          className="btn-accept"
          onClick={() => onAccept(shipment.shipmentId)}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default ShipmentCard;