import React, { useState } from 'react';

const CITIES = [
  'Mumbai, MH',
  'Delhi, DL',
  'Bangalore, KA',
  'Chennai, TN',
  'Hyderabad, TS',
  'Pune, MH',
  'Kolkata, WB',
  'Ahmedabad, GJ',
  'Jaipur, RJ',
  'Surat, GJ',
  'Lucknow, UP',
  'Kochi, KL',
  'Chandigarh, PB',
  'Nagpur, MH',
  'Bhopal, MP',
];

const LocationSelector = ({ onSearch, isLoading }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  const handleSearch = () => {
    if (source && destination && source !== destination) {
      onSearch(source, destination);
    }
  };

  return (
    <div className="search-card">
      <h3>Search Available Shipments</h3>
      <div className="search-row">
        <div className="input-group">
          <label htmlFor="source">Source Location</label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">Select Origin...</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="destination">Destination Location</label>
          <select
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            <option value="">Select Destination...</option>
            {CITIES.map((city) => (
              <option key={city} value={city} disabled={city === source}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={handleSearch}
          disabled={isLoading || !source || !destination || source === destination}
        >
          {isLoading ? 'Searching...' : 'Find Shipments'}
        </button>
      </div>
    </div>
  );
};

export default LocationSelector;