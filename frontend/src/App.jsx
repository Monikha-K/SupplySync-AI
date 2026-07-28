import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ActiveShipmentsCard from './components/ActiveShipmentsCard';
import ScenarioSimulatorCard from './components/ScenarioSimulatorCard';
import PredictionOutputCard from './components/PredictionOutputCard';
import FeasibilityCheckerCard from './components/FeasibilityCheckerCard';
import PredictionHistoryCard from './components/PredictionHistoryCard';

export default function App() {
  const [shipments, setShipments] = useState([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [activePrediction, setActivePrediction] = useState(null);
  const [batchSummary, setBatchSummary] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);

  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  useEffect(() => {
    loadShipments();
    loadHistory();
  }, []);

  const loadShipments = async () => {
    try {
      const res = await fetch('/api/shipments');
      if (res.ok) {
        const data = await res.json();
        setShipments(data);
        if (data.length > 0 && !selectedShipmentId) {
          setSelectedShipmentId(data[0].shipment_id);
        }
      }
    } catch (err) {
      console.error('Failed to load shipments:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/predictions?limit=20');
      if (res.ok) {
        const data = await res.json();
        setHistoryLogs(data);
      }
    } catch (err) {
      console.error('Failed to load prediction history:', err);
    }
  };

  const handleSelectShipment = (id) => {
    setSelectedShipmentId(id);
  };

  const handleRunSinglePrediction = async (updatePayload) => {
    if (!selectedShipmentId) return;

    setIsLoadingSingle(true);
    setBatchSummary(null);

    try {
      // 1. Update simulation parameters in backend
      await fetch(`/api/shipments/${selectedShipmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      // 2. Trigger risk prediction
      const res = await fetch(`/api/predict/${selectedShipmentId}`, { method: 'POST' });
      const pred = await res.json();

      setIsLoadingSingle(false);
      setActivePrediction(pred);
      loadShipments();
      loadHistory();
    } catch (err) {
      setIsLoadingSingle(false);
      alert('Error running risk prediction: ' + err);
    }
  };

  const handleRunAllPredictions = async () => {
    setIsProcessingBatch(true);
    setIsLoadingSingle(true);
    setBatchSummary(null);

    try {
      const res = await fetch('/api/predict/all', { method: 'POST' });
      const predictions = await res.json();

      setIsLoadingSingle(false);
      setIsProcessingBatch(false);

      if (!res.ok) {
        alert('Error running batch predictions: ' + (predictions.detail || 'Unknown error'));
        return;
      }

      // Compute statistics
      let highRiskCount = 0;
      let emailsCount = 0;
      let safeCount = 0;

      predictions.forEach((p) => {
        if (p.risk_score >= 70) {
          highRiskCount++;
        } else {
          safeCount++;
        }
        if (p.customer_notified) {
          emailsCount++;
        }
      });

      setBatchSummary({
        total: predictions.length,
        highRisk: highRiskCount,
        emails: emailsCount,
        safe: safeCount
      });

      // Display selected or first prediction
      const displayPred = predictions.find((p) => p.shipment_id === selectedShipmentId) || predictions[0];
      if (displayPred) {
        setActivePrediction(displayPred);
      }

      loadShipments();
      loadHistory();
    } catch (err) {
      setIsLoadingSingle(false);
      setIsProcessingBatch(false);
      alert('Error running batch predictions: ' + err);
    }
  };

  const handleRunFeasibilityCheck = async (payload) => {
    const res = await fetch('/api/feasibility-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Feasibility check failed');
    }

    loadShipments();
    loadHistory();
    return data;
  };

  const selectedShipment = shipments.find((s) => s.shipment_id === selectedShipmentId);

  return (
    <div>
      <Header />

      <div className="container">
        <div className="grid-layout">
          {/* Left Column: Active Shipments & Simulation Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ActiveShipmentsCard
              shipments={shipments}
              selectedShipmentId={selectedShipmentId}
              onSelectShipment={handleSelectShipment}
              onRunAllPredictions={handleRunAllPredictions}
              isProcessingBatch={isProcessingBatch}
            />

            <ScenarioSimulatorCard
              selectedShipment={selectedShipment}
              onRunSinglePrediction={handleRunSinglePrediction}
              isLoading={isLoadingSingle}
            />
          </div>

          {/* Right Column: AI Reasoning Output & Email Action */}
          <PredictionOutputCard
            prediction={activePrediction}
            batchSummary={batchSummary}
            isLoading={isLoadingSingle}
          />
        </div>

        {/* Dynamic Product Feasibility & Auto-Dispatch Agent Card */}
        <FeasibilityCheckerCard
          onRunFeasibilityCheck={handleRunFeasibilityCheck}
        />

        {/* History Section */}
        <PredictionHistoryCard
          historyLogs={historyLogs}
          onRefreshHistory={loadHistory}
        />
      </div>
    </div>
  );
}
