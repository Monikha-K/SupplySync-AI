import React from 'react';

const Navbar = () => {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">🚚</div>
        <div>
          <div className="navbar-title">SupplySync AI</div>
          <div className="navbar-subtitle">Shipment Recommendation Agent</div>
        </div>
      </div>
      <div className="navbar-right">
        <span className="navbar-date">{today}</span>
        <button className="navbar-icon-btn" title="Notifications">🔔</button>
        <div className="navbar-driver-badge">
          <span>👤</span>
          <span>Driver Portal</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
