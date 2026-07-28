import { useState, useEffect } from 'react';
import { fetchHealth } from '../api.js';

export default function Navbar({ onBrandClick, onCreateClick, onDBClick }) {
  const [dbStatus, setDbStatus] = useState({ label: 'Checking...', isAtlas: null });

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    try {
      const data = await fetchHealth();
      if (data.atlasConnected) {
        setDbStatus({ label: `Atlas: Connected (${data.dbName})`, isAtlas: true });
      } else {
        setDbStatus({ label: 'Demo Mode (In-Memory)', isAtlas: false });
      }
    } catch {
      setDbStatus({ label: 'Offline / Error', isAtlas: false });
    }
  }

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <button className="brand" onClick={onBrandClick}>
          <div className="brand-icon">S</div>
          <div className="brand-title">
            SupplySync AI
            <span className="brand-badge">Agent v2.4</span>
          </div>
        </button>

        <div className="nav-right">
          <button className="btn-pill primary" onClick={onCreateClick}>
            ➕ Create Shipment
          </button>

          <button
            className="db-status-pill"
            onClick={onDBClick}
            title="Click to view MongoDB Atlas connection info"
          >
            <div className={`pulse-dot ${dbStatus.isAtlas === false ? 'warning' : ''}`} />
            <span>{dbStatus.label}</span>
          </button>

          <button className="btn-pill">
            Profile <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>👤</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
