import React from 'react';
import LocationSelector from '../components/shipments/LocationSelector';
import ShipmentCard from '../components/shipments/ShipmentCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useShipments } from '../hooks/useShipments';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const {
    isLoading,
    error,
    hasSearched,
    recommendedShipment,
    otherShipments,
    searchShipments,
    handleAccept,
  } = useShipments();

  return (
    <div className="dashboard-page">
      <section className="hero-section">
        <h2>Shipment Recommendations</h2>
        <p>Select your source and destination to find the best available shipments ranked by organization rating.</p>
      </section>

      <LocationSelector onSearch={searchShipments} isLoading={isLoading} />

      {isLoading && <LoadingSpinner message="Searching for available shipments..." />}

      {!isLoading && error && (
        <div className="error-state">
          <span className="state-icon">⚠️</span>
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && hasSearched && !recommendedShipment && (
        <div className="empty-state">
          <span className="state-icon">📭</span>
          <h3>No Shipments Found</h3>
          <p>There are no available shipments for this route at the moment. Try a different route.</p>
        </div>
      )}

      {!isLoading && recommendedShipment && (
        <>
          <div className="recommended-section">
            <p className="section-title accent">⭐ Recommended Shipment</p>
            <ShipmentCard
              shipment={recommendedShipment}
              isRecommended={true}
              onAccept={handleAccept}
            />
          </div>

          {otherShipments.length > 0 && (
            <div className="other-section">
              <p className="section-title">Other Available Shipments</p>
              {otherShipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.shipmentId}
                  shipment={shipment}
                  isRecommended={false}
                  onAccept={handleAccept}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;