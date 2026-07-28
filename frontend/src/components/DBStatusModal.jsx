import { useState, useEffect } from 'react';
import { fetchHealth, seedDatabase } from '../api.js';

export default function DBStatusModal({ isOpen, onClose }) {
  const [healthData, setHealthData] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkHealth();
      setSeedMsg('');
    }
  }, [isOpen]);

  async function checkHealth() {
    try {
      const data = await fetchHealth();
      setHealthData(data);
    } catch {
      setHealthData({ atlasConnected: false, connectionMessage: 'Cannot reach backend server.' });
    }
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg('');
    try {
      const data = await seedDatabase();
      setSeedMsg(data.message || 'Done!');
    } catch {
      setSeedMsg('Failed to connect to seed endpoint.');
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">MongoDB Atlas Status</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-desc">Database Connection Diagnostics:</p>

        <div className="code-box">
          {healthData ? (
            healthData.atlasConnected ? (
              <>
                ✅ <strong>Status:</strong> Connected to MongoDB Atlas<br />
                ⚡ <strong>Database:</strong> {healthData.dbName}<br />
                📦 <strong>Shipments:</strong> {healthData.sampleIds?.join(', ')}
              </>
            ) : (
              <>
                ⚠️ <strong>Status:</strong> {healthData.connectionMessage}<br />
                💡 Using pre-seeded in-memory dataset (SHP1001–SHP1004)
              </>
            )
          ) : (
            'Checking connection...'
          )}
        </div>

        <p className="modal-desc">
          Configure MongoDB Atlas in <code>backend/.env</code>:
        </p>
        <div className="code-box">
          MONGODB_URI=mongodb+srv://supplysync:&lt;password&gt;@cluster.mongodb.net/?appName=...
        </div>

        {seedMsg && (
          <p style={{ color: '#4ADE80', fontSize: '0.85rem', marginBottom: '12px' }}>✅ {seedMsg}</p>
        )}

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handleSeed}
            disabled={seeding || !healthData?.atlasConnected}
            title={!healthData?.atlasConnected ? 'Connect to Atlas first to seed' : ''}
          >
            {seeding ? 'Seeding...' : '🌱 Seed Atlas Demo Data'}
          </button>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '8px 18px', fontSize: '0.85rem' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
