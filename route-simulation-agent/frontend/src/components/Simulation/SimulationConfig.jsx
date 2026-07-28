import React, { useState } from 'react';

const SimulationConfig = ({ shipment, onGenerate }) => {
  const [config, setConfig] = useState({
    simulationSpeedStr: 'Normal',
    simulationMode: 'Normal Journey',
    checkpointInterval: '25 km',
    animationSpeed: 'Medium'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeUp 0.3s ease' }}>
      <div className="card-header">
        <div className="card-title">⚙️ Configure Simulation</div>
      </div>
      <div className="card-body">
        
        <div className="section-title-inline" style={{ marginTop: 0 }}>SHIPMENT INFORMATION</div>
        <div className="data-grid" style={{ marginBottom: '2rem' }}>
          {[
            ['Shipment ID', <span style={{ fontFamily: 'monospace' }}>{shipment.shipmentId}</span>],
            ['Organization', shipment.organizationName],
            ['Route', `${shipment.source} → ${shipment.destination}`],
            ['Distance', `${shipment.distanceKm} km`],
            ['Average ETA', `${shipment.averageETAHours} hrs`],
            ['Vehicle', shipment.vehicleType || 'Truck'],
            ['Weight', shipment.shipmentWeight || 'N/A'],
          ].map(([lbl, val]) => (
            <div key={lbl} className="data-item">
              <div className="label">{lbl}</div>
              <div className="value">{val}</div>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div className="section-title-inline">SIMULATION SETTINGS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          
          <div>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Simulation Speed</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['Normal', 'Fast', 'Very Fast'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="radio" name="simulationSpeedStr" value={opt} checked={config.simulationSpeedStr === opt} onChange={handleChange} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Simulation Mode</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Normal Journey', 'Heavy Traffic', 'Heavy Rain', 'Road Block', 'Vehicle Breakdown'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="radio" name="simulationMode" value={opt} checked={config.simulationMode === opt} onChange={handleChange} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Checkpoint Interval</label>
            <select 
              name="checkpointInterval" 
              value={config.checkpointInterval} 
              onChange={handleChange}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', width: '100%' }}
            >
              <option value="10 km">10 km</option>
              <option value="25 km">25 km</option>
              <option value="50 km">50 km</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Animation Speed</label>
            <select 
              name="animationSpeed" 
              value={config.animationSpeed} 
              onChange={handleChange}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', width: '100%' }}
            >
              <option value="Slow">Slow</option>
              <option value="Medium">Medium</option>
              <option value="Fast">Fast</option>
            </select>
          </div>
          
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="btn btn-primary" onClick={() => onGenerate(shipment.shipmentId, config)} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            ⚡ Generate Simulation
          </button>
        </div>

      </div>
    </div>
  );
};

export default SimulationConfig;
