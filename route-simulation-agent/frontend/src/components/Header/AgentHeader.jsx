import React from 'react';

const AgentHeader = ({ shipmentId, organizationName }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="logo-icon">🚚</span>
        <div>
          <h1>SupplySync AI</h1>
          <span className="nav-sub">Route Simulation Agent</span>
        </div>
        <span className="ai-badge">AI Agent</span>
      </div>
      <div className="nav-shipment-info">
        <div className="nav-shipment-id">#{shipmentId}</div>
        <div className="nav-org">{organizationName}</div>
      </div>
    </nav>
  );
};

export default AgentHeader;
