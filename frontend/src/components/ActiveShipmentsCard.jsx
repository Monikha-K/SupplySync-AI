import React from 'react';

export default function ActiveShipmentsCard({
  shipments,
  selectedShipmentId,
  onSelectShipment,
  onRunAllPredictions,
  isProcessingBatch
}) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          📦 Active Logistics Shipments
        </div>
        <button
          className="btn btn-secondary"
          id="btnRunAll"
          disabled={isProcessingBatch}
          style={{ width: 'auto', padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={onRunAllPredictions}
        >
          {isProcessingBatch ? '⏳ Processing All Agent Predictions...' : '⚡ Run All Agent Predictions'}
        </button>
      </div>

      <div className="shipment-cards">
        {shipments.map((s) => {
          const isSelected = s.shipment_id === selectedShipmentId;
          const trafficTagClass = s.traffic === 'Heavy' ? 'tag-danger' : (s.traffic === 'Moderate' ? 'tag-warning' : 'tag-success');
          const weatherTagClass = ['Rain', 'Storm', 'Fog'].includes(s.weather) ? 'tag-danger' : 'tag-success';

          return (
            <div
              key={s.shipment_id}
              className={`shipment-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectShipment(s.shipment_id)}
            >
              <div className="shipment-id-row">
                <span className="shipment-id">{s.shipment_id}</span>
                <span className="customer-name">{s.customer_name}</span>
              </div>
              <div className="route-info">
                {s.source} ➔ {s.destination} ({s.distance_remaining} km)
              </div>
              <div className="tags-row">
                <span className={`tag ${trafficTagClass}`}>🚦 {s.traffic}</span>
                <span className={`tag ${weatherTagClass}`}>🌧️ {s.weather}</span>
                <span className="tag">🔧 {s.vehicle_health}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
