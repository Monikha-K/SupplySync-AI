import React, { useState, useEffect } from 'react';

export default function ScenarioSimulatorCard({
  selectedShipment,
  onRunSinglePrediction,
  isLoading
}) {
  const [traffic, setTraffic] = useState('Light');
  const [weather, setWeather] = useState('Clear');
  const [vehicleHealth, setVehicleHealth] = useState('Healthy');
  const [driverStatus, setDriverStatus] = useState('Available');

  useEffect(() => {
    if (selectedShipment) {
      setTraffic(selectedShipment.traffic || 'Light');
      setWeather(selectedShipment.weather || 'Clear');
      setVehicleHealth(selectedShipment.vehicle_health || 'Healthy');
      setDriverStatus(selectedShipment.driver_status || 'Available');
    }
  }, [selectedShipment]);

  const handleSubmit = () => {
    if (!selectedShipment) return;
    onRunSinglePrediction({
      traffic,
      weather,
      vehicle_health: vehicleHealth,
      driver_status: driverStatus
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          ⚙️ Real-time Scenario Simulator
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Traffic Status</label>
          <select value={traffic} onChange={(e) => setTraffic(e.target.value)}>
            <option value="Light">Light Traffic</option>
            <option value="Moderate">Moderate Traffic</option>
            <option value="Heavy">Heavy Traffic / Gridlock</option>
          </select>
        </div>
        <div className="form-group">
          <label>Weather Condition</label>
          <select value={weather} onChange={(e) => setWeather(e.target.value)}>
            <option value="Clear">Clear Skies</option>
            <option value="Fog">Heavy Fog</option>
            <option value="Rain">Monsoon Rain</option>
            <option value="Storm">Severe Thunderstorm</option>
          </select>
        </div>
        <div className="form-group">
          <label>Vehicle Health</label>
          <select value={vehicleHealth} onChange={(e) => setVehicleHealth(e.target.value)}>
            <option value="Healthy">Healthy / Normal</option>
            <option value="Tire Pressure Low">Tire Pressure Low</option>
            <option value="Engine Warning">Engine Overheating Alert</option>
          </select>
        </div>
        <div className="form-group">
          <label>Driver Status</label>
          <select value={driverStatus} onChange={(e) => setDriverStatus(e.target.value)}>
            <option value="Available">Available / Fresh</option>
            <option value="Rest Required">Rest Break Required</option>
            <option value="Overtime">Overtime Limit Exceeded</option>
          </select>
        </div>
      </div>
      <button
        className="btn"
        disabled={isLoading || !selectedShipment}
        onClick={handleSubmit}
      >
        {isLoading ? '🧠 Analyzing Risk Scenario...' : '🧠 Trigger Gemini Risk Reasoning Agent'}
      </button>
    </div>
  );
}
