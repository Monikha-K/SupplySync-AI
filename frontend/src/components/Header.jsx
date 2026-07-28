import React from 'react';

export default function Header() {
  return (
    <header>
      <div className="logo-group">
        <div className="logo-icon">S</div>
        <div className="logo-text">
          <h1>SupplySync AI</h1>
          <p>Autonomous Risk Prediction Agent</p>
        </div>
      </div>
      <div className="header-actions">
        <div className="threshold-badge">Threshold: <strong>70% Risk Score</strong></div>
        <div className="badge-status">
          <span></span> Autonomous Agent Active
        </div>
      </div>
    </header>
  );
}
