import { useState } from 'react';
import { createShipment } from '../api.js';

export default function CreateShipmentModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    shipmentId: '', driverName: '', driverPhone: '',
    pickup: '', destination: '', currentLocation: '', progress: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await createShipment(form);
      if (data.success && data.shipment) {
        onCreated(data.shipment);
        onClose();
        setForm({ shipmentId: '', driverName: '', driverPhone: '', pickup: '', destination: '', currentLocation: '', progress: 50 });
      } else {
        setError(data.message || 'Error creating shipment.');
      }
    } catch {
      setError('Server communication error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Create New Shipment Record</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-input-group">
            <label className="input-label">Shipment ID *</label>
            <input
              className="modal-input" name="shipmentId" required
              placeholder="e.g. SHP2026" value={form.shipmentId} onChange={handleChange}
            />
          </div>

          <div className="modal-grid-2">
            <div className="input-group">
              <label className="input-label">Driver Name *</label>
              <input
                className="modal-input" name="driverName" required
                placeholder="e.g. Rahul Sharma" value={form.driverName} onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Driver Phone</label>
              <input
                className="modal-input" name="driverPhone"
                placeholder="+91 98000 11111" value={form.driverPhone} onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-grid-2">
            <div className="input-group">
              <label className="input-label">Pickup Origin *</label>
              <input
                className="modal-input" name="pickup" required
                placeholder="e.g. Chennai" value={form.pickup} onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Destination *</label>
              <input
                className="modal-input" name="destination" required
                placeholder="e.g. Coimbatore" value={form.destination} onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-grid-2">
            <div className="input-group">
              <label className="input-label">Current Location</label>
              <input
                className="modal-input" name="currentLocation"
                placeholder="e.g. Salem" value={form.currentLocation} onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Progress (%)</label>
              <input
                className="modal-input" type="number" name="progress"
                min="0" max="100" value={form.progress} onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: '#F87171', fontSize: '0.85rem', marginBottom: '12px' }}>⚠️ {error}</p>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: 'auto', padding: '10px 24px', fontSize: '0.9rem' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
