import { useState, useCallback } from 'react';
import { simulateStep } from '../api.js';
import MetricCards from './MetricCards.jsx';
import MapView from './MapView.jsx';
import ProgressSection from './ProgressSection.jsx';
import Timeline from './Timeline.jsx';
import AIAssistant from './AIAssistant.jsx';
import SimulationFeed from './SimulationFeed.jsx';

export default function ResultsScreen({ shipment, onShipmentUpdate, onBackToSearch }) {
  const [simRunning, setSimRunning] = useState(false);
  const [simLogs, setSimLogs] = useState([]);
  const [simInterval, setSimIntervalState] = useState(null);

  const appendLog = useCallback((msg) => {
    setSimLogs(prev => [msg, ...prev].slice(0, 20));
  }, []);

  function startSimulation() {
    if (!shipment) return;
    appendLog(`📡 Started real-time telemetry simulation for ${shipment.shipmentId}...`);
    setSimRunning(true);

    const interval = setInterval(async () => {
      try {
        const data = await simulateStep(shipment.shipmentId);
        if (data.success && data.shipment) {
          onShipmentUpdate(data.shipment);
          if (data.log) appendLog(data.log);
          if (data.shipment.progress >= 100) {
            appendLog(`🎉 ${data.shipment.shipmentId} reached its destination!`);
            stopSim(interval);
          }
        }
      } catch {
        appendLog('⚠️ Telemetry pulse error — retrying...');
      }
    }, 2500);

    setSimIntervalState(interval);
  }

  function stopSim(intervalRef) {
    clearInterval(intervalRef || simInterval);
    setSimIntervalState(null);
    setSimRunning(false);
  }

  function toggleSimulation() {
    if (simRunning) {
      stopSim();
    } else {
      startSimulation();
    }
  }

  function exportReport() {
    window.print();
  }

  if (!shipment) return null;

  return (
    <section className="results-view" id="resultsScreen">
      {/* Meta Header */}
      <div className="shipment-meta-card">
        <div className="meta-info-primary">
          <h2>
            <span>Shipment ID:</span>
            <span className="meta-id-highlight">{shipment.shipmentId}</span>
          </h2>
          <div className="meta-route">
            Route: <strong>{shipment.pickup}</strong> ➔ <strong>{shipment.destination}</strong>
          </div>
        </div>

        <div className="meta-right">
          <div className="driver-info">
            <strong>{shipment.driverName}</strong>
            <span style={{ fontSize: '0.75rem', display: 'block', opacity: 0.7 }}>
              Last Updated: {shipment.lastUpdated}
            </span>
          </div>

          <button
            className={`btn-simulate ${simRunning ? 'active' : ''}`}
            onClick={toggleSimulation}
          >
            {simRunning ? '⏸ Pause Simulation' : '▶ Simulate Live Movement'}
          </button>

          <button className="btn-secondary" onClick={exportReport}>📄 Export Report</button>
          <button className="btn-secondary" onClick={onBackToSearch}>🔍 New Search</button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <MetricCards shipment={shipment} />

      {/* Live Map */}
      <MapView shipment={shipment} />

      {/* Progress + Telemetry */}
      <ProgressSection shipment={shipment} />

      {/* Journey Timeline */}
      <Timeline timeline={shipment.timeline} />

      {/* Simulation Feed (only when running) */}
      {(simRunning || simLogs.length > 0) && (
        <SimulationFeed logs={simLogs} isLive={simRunning} />
      )}

      {/* AI Summary + Query */}
      <AIAssistant shipment={shipment} />
    </section>
  );
}
