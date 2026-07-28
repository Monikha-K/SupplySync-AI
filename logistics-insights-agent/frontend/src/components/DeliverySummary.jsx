import React from 'react';

const DeliverySummary = ({ report }) => {
  const items = [
    { label: 'Shipment ID', value: report.shipmentId },
    { label: 'Organization', value: report.organizationName },
    { label: 'Source', value: report.source },
    { label: 'Destination', value: report.destination },
    { label: 'Vehicle Type', value: report.vehicleType },
    { label: 'Shipment Weight', value: `${report.shipmentWeight} kg` },
    { label: 'Distance', value: `${report.distanceKm} km` },
  ];

  return (
    <div className="report-section">
      <div className="section-title">
        <span className="section-icon">📦</span>
        Delivery Summary
      </div>
      <div className="summary-grid">
        {items.map((item) => (
          <div key={item.label} className="summary-item">
            <span className="summary-label">{item.label}</span>
            <span className="summary-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliverySummary;
