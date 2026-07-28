import React, { useState } from 'react';

export default function FeasibilityCheckerCard({ onRunFeasibilityCheck }) {
  const [source, setSource] = useState('Chicago, IL');
  const [destination, setDestination] = useState('Dallas, TX');
  const [productName, setProductName] = useState('OLED Display Panels');
  const [category, setCategory] = useState('Electronics');
  const [weightKg, setWeightKg] = useState(45);
  const [quantity, setQuantity] = useState(120);
  const [isFragile, setIsFragile] = useState('true');
  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [customerEmail, setCustomerEmail] = useState('raghu402554@gmail.com');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const prefillPreset = (preset) => {
    if (preset === 'electronics') {
      setSource('Chicago, IL');
      setDestination('Dallas, TX');
      setProductName('OLED Display Panels');
      setCategory('Electronics');
      setWeightKg(45);
      setQuantity(120);
      setIsFragile('true');
      setCustomerName('Rahul Sharma');
      setCustomerEmail('raghu402554@gmail.com');
    } else if (preset === 'glassware') {
      setSource('New York, NY');
      setDestination('Miami, FL');
      setProductName('Precision Optical Lenses');
      setCategory('Glassware');
      setWeightKg(18);
      setQuantity(50);
      setIsFragile('true');
      setCustomerName('Sophia Chen');
      setCustomerEmail('raghu402554@gmail.com');
    } else if (preset === 'medical') {
      setSource('Seattle, WA');
      setDestination('Los Angeles, CA');
      setProductName('Automated Diagnostic Ventilators');
      setCategory('Medical');
      setWeightKg(150);
      setQuantity(10);
      setIsFragile('true');
      setCustomerName('Dr. Marcus Vance');
      setCustomerEmail('raghu402554@gmail.com');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);

    const payload = {
      source,
      destination,
      product_name: productName,
      product_category: category,
      weight_kg: parseFloat(weightKg) || 1.0,
      quantity: parseInt(quantity, 10) || 1,
      is_fragile: isFragile === 'true',
      customer_name: customerName,
      customer_email: customerEmail
    };

    try {
      const data = await onRunFeasibilityCheck(payload);
      setResult(data);
    } catch (err) {
      alert("Feasibility evaluation failed: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '30px' }}>
      <div className="card-header">
        <div className="card-title">
          🚀 Dynamic Route Feasibility & Product Auto-Dispatch Agent
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 10px', fontSize: '11px' }} onClick={() => prefillPreset('electronics')}>⚡ Electronics</button>
          <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 10px', fontSize: '11px' }} onClick={() => prefillPreset('glassware')}>⚡ Fragile Glassware</button>
          <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 10px', fontSize: '11px' }} onClick={() => prefillPreset('medical')}>⚡ Medical Equipment</button>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Enter product & route details below. The Autonomous Agent will auto-detect weather and traffic along the route, evaluate transport feasibility, and automatically dispatch a status email to the customer.
      </p>

      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div className="form-group">
          <label>Source City / Origin</label>
          <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Chicago, IL" />
        </div>
        <div className="form-group">
          <label>Destination City</label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Dallas, TX" />
        </div>
        <div className="form-group">
          <label>Product Name</label>
          <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. OLED Display Panels" />
        </div>
        <div className="form-group">
          <label>Product Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Electronics">Electronics</option>
            <option value="Medical">Medical Devices</option>
            <option value="Glassware">Glassware / Fragile</option>
            <option value="Perishable">Perishable Goods</option>
            <option value="General">General Freight</option>
          </select>
        </div>
        <div className="form-group">
          <label>Weight (kg)</label>
          <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} min="0.1" step="0.1" />
        </div>
        <div className="form-group">
          <label>Quantity (Units)</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
        </div>
        <div className="form-group">
          <label>Fragile Handling</label>
          <select value={isFragile} onChange={(e) => setIsFragile(e.target.value)}>
            <option value="false">No (Standard Freight)</option>
            <option value="true">Yes (Air-Cushioned / Fragile)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Customer Name</label>
          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label>Customer Email Address</label>
          <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
        </div>
      </div>

      <button
        className="btn"
        disabled={isLoading}
        onClick={handleSubmit}
        style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))', fontSize: '15px', padding: '14px' }}
      >
        {isLoading ? '🌐 Inspecting Route & Dispatching Email...' : '🌐 Auto-Inspect Weather/Traffic & Dispatch Customer Email'}
      </button>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="pulse-loader" style={{ marginTop: '20px' }}>
          <div className="spinner"></div>
          <span>Autonomous Agent is querying live weather, traffic, and evaluating product route feasibility...</span>
        </div>
      )}

      {/* Result Panel */}
      {result && !isLoading && (
        <div className="result-container active" style={{ marginTop: '24px' }}>
          <div className="gauge-section">
            <div className="gauge-details">
              <h3>{result.feasibility_status}</h3>
              <p>{result.product_summary?.product_name} ({result.product_summary?.weight_kg} kg) • {result.weather_summary?.summary || 'Route Inspected'}</p>
              <p style={{ color: '#60a5fa', fontWeight: 600, marginTop: '4px' }}>
                Distance: {result.estimated_distance_km} km | Estimated Transit: {result.estimated_transit_hours} Hours
              </p>
            </div>
            <div className={`score-circle ${result.risk_level?.toLowerCase()}`}>
              <span>{result.risk_score}</span>
              <span className="score-label">Risk Score</span>
            </div>
          </div>

          <div className={`action-banner ${result.risk_score >= 70 ? 'high-risk' : 'monitored'}`}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <span><strong>Autonomous Action Executed:</strong> {result.action_taken}</span>
          </div>

          <div className="details-grid">
            <div className="info-box">
              <h4>Auto-Detected Environment Metrics</h4>
              <ul>
                <li>🌦️ <strong>Weather:</strong> {result.weather_summary?.summary || 'Clear'}</li>
                <li>🚦 <strong>Traffic:</strong> {result.traffic_summary?.traffic_status || 'Light'} (Slowdown: {result.traffic_summary?.slowdown_multiplier || 1.0}x)</li>
                <li>📦 <strong>Product:</strong> {result.product_summary?.product_name} ({result.product_summary?.quantity} units, {result.product_summary?.weight_kg} kg, Fragile: {result.product_summary?.is_fragile ? 'Yes' : 'No'})</li>
              </ul>
            </div>
            <div className="info-box">
              <h4>AI Recommendations & Mitigation</h4>
              <ul>
                {(result.recommended_actions || []).map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Email Preview */}
          {result.customer_notified && result.email_content && (
            <div className="email-preview">
              <div className="email-header">
                📬 <strong>Autonomous Feasibility Dispatch Email</strong> • Status: <span style={{ color: '#4ade80', fontWeight: 600 }}>{result.email_content.status || 'Dispatched'}</span>
              </div>
              <div style={{ fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>
                <strong>To:</strong> {result.email_content.recipient || result.product_summary?.customer_email}
              </div>
              <div className="email-subject">{result.email_content.subject}</div>
              <div className="email-body">{result.email_content.body}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
