import React, { useState } from 'react';

const RouteSelector = ({ sources, destinations, onSearch }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  const sorted = arr => [...(arr || [])].sort();
  const canSearch = source && destination && source !== destination;

  return (
    <div className="selection-card">
      <h3>🗺️ Select Route</h3>

      <div className="form-group">
        <label className="form-label">Source District</label>
        <select
          id="source-select"
          className="form-select"
          value={source}
          onChange={e => setSource(e.target.value)}
        >
          <option value="">Select source district...</option>
          {sorted(sources).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Destination District</label>
        <select
          id="destination-select"
          className="form-select"
          value={destination}
          onChange={e => setDestination(e.target.value)}
        >
          <option value="">Select destination district...</option>
          {sorted(destinations).map(d => (
            <option key={d} value={d} disabled={d === source}>{d}</option>
          ))}
        </select>
      </div>

      <button
        id="recommend-btn"
        className="btn-primary"
        onClick={() => onSearch(source, destination)}
        disabled={!canSearch}
      >
        Recommend Shipment
      </button>
    </div>
  );
};

export default RouteSelector;
