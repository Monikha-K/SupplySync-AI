import React, { useState } from 'react';

const LocationSelector = ({ sources, destinations, onSearch, isLoading }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  const sorted = arr => [...(arr || [])].sort();
  const canSearch = source && destination && source !== destination;

  const handleClear = () => { setSource(''); setDestination(''); };

  return (
    <div className="search-card">
      <div className="search-card-header">
        <div className="search-card-title">🔍 Find Available Shipments</div>
        <div className="search-card-subtitle">
          Select your pickup and delivery districts to see AI-recommended loads
        </div>
      </div>

      <div className="search-form">
        <div className="form-group">
          <label className="form-label">📍 Source District</label>
          <select
            id="source-select"
            className="form-select"
            value={source}
            onChange={e => setSource(e.target.value)}
          >
            <option value="">Choose origin...</option>
            {sorted(sources).map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">🏁 Destination District</label>
          <select
            id="destination-select"
            className="form-select"
            value={destination}
            onChange={e => setDestination(e.target.value)}
          >
            <option value="">Choose destination...</option>
            {sorted(destinations).map(city => (
              <option key={city} value={city} disabled={city === source}>{city}</option>
            ))}
          </select>
        </div>

        <button
          id="find-shipments-btn"
          className="btn btn-primary"
          onClick={() => canSearch && onSearch(source, destination)}
          disabled={isLoading || !canSearch}
        >
          {isLoading ? '⏳ Searching...' : '🚀 Find Shipments'}
        </button>

        <button
          className="btn btn-outline"
          onClick={handleClear}
          disabled={isLoading}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default LocationSelector;
