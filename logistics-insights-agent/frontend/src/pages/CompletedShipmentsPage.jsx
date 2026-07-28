import React, { useEffect, useState } from 'react';
import { getCompletedShipments } from '../services/insightsApi';
import CompletedShipmentCard from '../components/CompletedShipmentCard';

const CompletedShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCompletedShipments();
      setShipments(data);
    } catch (err) {
      console.error(err);
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">📦</span>
          <div>
            <h1>SupplySync AI</h1>
            <span className="nav-sub">Logistics Insights Agent</span>
          </div>
        </div>
        <div className="ai-badge">Agent Active</div>
      </nav>

      <main>
        <div className="page-header">
          <h2>Completed Shipments</h2>
          <p>Analyze performance and generate logistics insights for successfully delivered shipments.</p>
        </div>

        {loading ? (
          <div className="state-message">
            <span className="loading-spinner-sm" style={{ width: 30, height: 30 }} />
            <p>Loading completed shipments...</p>
          </div>
        ) : error ? (
          <div className="state-message">
            <span className="state-message-icon">🔌</span>
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button className="btn btn-secondary mt-3" onClick={fetchShipments}>
              Try Again
            </button>
          </div>
        ) : shipments.length === 0 ? (
          <div className="state-message">
            <span className="state-message-icon">📝</span>
            <h3>No Shipments Found</h3>
            <p>There are no completed shipments available for analysis yet.</p>
          </div>
        ) : (
          <div className="shipments-grid">
            {shipments.map((shipment) => (
              <CompletedShipmentCard key={shipment.shipmentId} shipment={shipment} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CompletedShipmentsPage;
