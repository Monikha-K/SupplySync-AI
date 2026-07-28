import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActionButtons = ({ onRefresh, report }) => {
  const navigate = useNavigate();

  const handleDownload = () => {
    if (!report) return;
    const content = `==================================================
SUPPLYSYNC AI - LOGISTICS PERFORMANCE REPORT
==================================================
Shipment ID:      ${report.shipmentId}
Organization:     ${report.organizationName}
Source:           ${report.source}
Destination:      ${report.destination}
Vehicle Type:     ${report.vehicleType}
Shipment Weight:  ${report.shipmentWeight} kg
Distance:         ${report.distanceKm} km

--------------------------------------------------
PERFORMANCE ANALYSIS
--------------------------------------------------
Planned ETA:      ${report.plannedETA} hours
Actual Travel Time: ${report.actualTravelTime} hours
Delay Minutes:    ${report.delayMinutes} minutes
Performance Score: ${report.performanceScore}/100
Delivery Status:  ${report.deliveryStatus}

--------------------------------------------------
JOURNEY EVENTS
--------------------------------------------------
${report.simulationEvents && report.simulationEvents.length > 0 
  ? report.simulationEvents.map(e => `- ${e}`).join('\n')
  : 'No incidents during journey.'}

--------------------------------------------------
AI LOGISTICS RECOMMENDATIONS
--------------------------------------------------
${report.recommendations && report.recommendations.length > 0
  ? report.recommendations.map(r => `* ${r}`).join('\n')
  : 'No recommendations available.'}
==================================================
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Logistics_Report_${report.shipmentId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="action-bar">
      <button className="btn btn-secondary" onClick={() => navigate('/')}>
        ← Back
      </button>
      <button className="btn btn-outline" onClick={onRefresh}>
        🔄 Refresh Report
      </button>
      <button className="btn btn-primary" onClick={handleDownload}>
        ⬇️ Download Report
      </button>
    </div>
  );
};

export default ActionButtons;
