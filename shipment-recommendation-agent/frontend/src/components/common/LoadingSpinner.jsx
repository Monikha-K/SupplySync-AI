import React from 'react';

const LoadingSpinner = () => (
  <div>
    <div className="skeleton-card" style={{ marginBottom: '2rem' }}>
      <div className="skeleton skeleton-badge" />
      <div className="skeleton skeleton-line-lg" style={{ width: '50%' }} />
      <div className="skeleton skeleton-line" style={{ width: '30%' }} />
      <div className="skeleton-detail-grid" style={{ marginTop: '1.5rem' }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="skeleton" style={{ height: '70px', borderRadius: '8px' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: '48px', borderRadius: '8px', marginTop: '1.5rem' }} />
    </div>

    <div className="loading-label">🔍 &nbsp;Searching for the best shipments for you...</div>

    <div className="shipment-cards-grid" style={{ marginTop: '1.5rem' }}>
      {[1,2,3].map(i => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-line-lg" style={{ width: '60%' }} />
          <div className="skeleton skeleton-line" style={{ width: '40%' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: '1rem 0' }}>
            {[1,2,3,4].map(j => (
              <div key={j} className="skeleton" style={{ height: '52px', borderRadius: '8px' }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: '36px', borderRadius: '8px' }} />
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSpinner;