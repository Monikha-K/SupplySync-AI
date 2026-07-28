import React from 'react';
import LocationSelector from '../components/shipments/LocationSelector';
import RecommendedShipment from '../components/shipments/RecommendedShipment';
import ShipmentCard from '../components/shipments/ShipmentCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useShipments } from '../hooks/useShipments';

const Dashboard = () => {
  const {
    sources, destinations,
    isLoading, error, hasSearched,
    recommendedShipment, otherShipments,
    searchShipments, handleAccept,
  } = useShipments();

  const hasResults = recommendedShipment || otherShipments.length > 0;

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-glow-2" />
        <div className="hero-content">
          <div className="hero-tag">🤖 AI-Powered Logistics</div>
          <h1 className="hero-title">
            Shipment&nbsp;
            <span className="hero-title-accent">Recommendation</span>
          </h1>
          <p className="hero-subtitle">
            Find the best available shipment for your route, ranked by organization
            rating and optimized for your delivery needs.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">38</div>
              <div className="hero-stat-label">TN Districts</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">10K+</div>
              <div className="hero-stat-label">Active Shipments</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">AI</div>
              <div className="hero-stat-label">Rating Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="dashboard-body">

        {/* Search */}
        <LocationSelector
          sources={sources}
          destinations={destinations}
          onSearch={searchShipments}
          isLoading={isLoading}
        />

        {/* Loading */}
        {isLoading && <LoadingSpinner />}

        {/* Error */}
        {!isLoading && error && (
          <div className="state-card error-card">
            <span className="state-icon">⚠️</span>
            <div className="state-title">Something went wrong</div>
            <div className="state-subtitle">{error}</div>
            <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && !error && (
          <>
            {!hasResults ? (
              <div className="state-card">
                <span className="state-icon">📦</span>
                <div className="state-title">No Shipments Available</div>
                <div className="state-subtitle">
                  There are no available shipments for the selected route right now.
                  Try a different source or destination.
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
                  🔄 Try Another Route
                </button>
              </div>
            ) : (
              <>
                {recommendedShipment && (
                  <>
                    <div className="section-heading">
                      <div className="section-heading-dot" />
                      AI Top Recommendation
                    </div>
                    <RecommendedShipment
                      shipment={recommendedShipment}
                      onAccept={handleAccept}
                    />
                  </>
                )}

                {otherShipments.length > 0 && (
                  <>
                    <div className="section-heading">
                      <div className="section-heading-dot" style={{ background: 'var(--text-muted)', boxShadow: 'none' }} />
                      Other Available Organizations ({otherShipments.length})
                    </div>
                    <div className="shipment-cards-grid">
                      {otherShipments.map(s => (
                        <ShipmentCard key={s.shipmentId} shipment={s} onAccept={handleAccept} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
