import { useState } from 'react';
import { fetchShipment } from '../api.js';

const QUICK_SAMPLES = [
  { id: 'SHP1001', label: 'SHP1001 (In Transit)' },
  { id: 'SHP1002', label: 'SHP1002 (Delayed)' },
  { id: 'SHP1003', label: 'SHP1003 (Delivered)' },
  { id: 'SHP1004', label: 'SHP1004 (Cold Chain)' },
];

export default function SearchScreen({ onShipmentFound }) {
  const [inputValue, setInputValue] = useState('SHP1001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function trackShipment(id) {
    const shipmentId = (id || inputValue).trim().toUpperCase();
    if (!shipmentId) return;

    setLoading(true);
    setError('');

    try {
      const data = await fetchShipment(shipmentId);
      if (data.success && data.shipment) {
        onShipmentFound(data.shipment);
      } else {
        setError(data.message || `Shipment '${shipmentId}' not found. Try SHP1001–SHP1004.`);
      }
    } catch {
      setError('Cannot connect to backend. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    trackShipment();
  }

  function selectSample(id) {
    setInputValue(id);
    trackShipment(id);
  }

  return (
    <section className="search-card" id="searchScreen">
      <p className="search-instruction">Track your shipment using the Shipment ID</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="shipmentInput" className="input-label">Shipment ID</label>
          <input
            type="text"
            id="shipmentInput"
            className="search-input"
            placeholder="e.g. SHP1001"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoComplete="off"
            spellCheck="false"
            required
          />
        </div>

        {error && (
          <p style={{ color: '#F87171', fontSize: '0.85rem', marginBottom: '12px', textAlign: 'left' }}>
            ⚠️ {error}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <><span className="spinner">⏳</span> Searching AI Network...</>
          ) : (
            '🔍 Track Shipment'
          )}
        </button>
      </form>

      <div className="quick-samples">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick Select:</span>
        {QUICK_SAMPLES.map(({ id, label }) => (
          <button
            key={id}
            className="sample-chip"
            onClick={() => selectSample(id)}
            disabled={loading}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
