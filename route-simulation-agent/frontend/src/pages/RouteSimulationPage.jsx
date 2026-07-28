import React, { useState, useEffect } from 'react';
import AgentHeader from '../components/Header/AgentHeader';
import AcceptedShipmentCard from '../components/AcceptedShipmentCard';
import SimulationConfig from '../components/Simulation/SimulationConfig';
import AIThinkingAnimation from '../components/AIThinkingAnimation';
import ShipmentSummaryCard from '../components/Shipment/ShipmentSummaryCard';
import RouteMap from '../components/Map/RouteMap';
import ProgressCard from '../components/Simulation/ProgressCard';
import SimulationControls from '../components/Simulation/SimulationControls';
import SimulationLog from '../components/Simulation/SimulationLog';
import CompletionCard from '../components/Simulation/CompletionCard';
import AISimulationStrategy from '../components/Simulation/AISimulationStrategy';
import { useSimulation } from '../hooks/useSimulation';
import * as api from '../services/simulationApi';

const STEPS = {
  SELECTION: 1,
  CONFIG: 2,
  LOADING: 3,
  WORKSPACE: 4
};

const RouteSimulationPage = () => {
  const [step, setStep] = useState(STEPS.SELECTION);
  const [acceptedShipments, setAcceptedShipments] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  
  const {
    simState,
    loadSimulation,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    setSpeed,
    triggerEvent
  } = useSimulation();

  const handleSelect = (shipmentId) => {
    const shipment = acceptedShipments.find(s => s.shipmentId === shipmentId);
    setSelectedShipment(shipment);
    setStep(STEPS.CONFIG);
  };

  const handleGenerate = async (shipmentId, config = {}) => {
    try {
      setStep(STEPS.LOADING);
      const simulationDoc = await api.startSimulation(shipmentId, config);
      loadSimulation(simulationDoc);
    } catch (e) {
      console.error('Failed to generate simulation:', e);
      setStep(STEPS.SELECTION);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlShipmentId = urlParams.get('shipmentId');
    if (urlShipmentId) {
      // Fetch specifically this shipment to show in config
      api.fetchAcceptedShipments().then(data => {
        const shipment = data.find(s => s.shipmentId === urlShipmentId);
        if (shipment) {
          setSelectedShipment(shipment);
          setStep(STEPS.CONFIG);
        } else {
          setStep(STEPS.SELECTION);
        }
      });
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (step === STEPS.SELECTION) {
      setIsFetching(true);
      api.fetchAcceptedShipments()
        .then(data => {
          setAcceptedShipments(data);
          setIsFetching(false);
        })
        .catch(err => {
          console.error(err);
          setIsFetching(false);
        });
    }
  }, [step]);

  const handleAnimationComplete = () => {
    setStep(STEPS.WORKSPACE);
  };

  const isFinished = simState && simState.progress >= 100;

  return (
    <div className="app-container">
      <AgentHeader 
        shipmentId={simState?.shipment?.shipmentId || selectedShipment?.shipmentId || 'PENDING'}
        organizationName={simState?.shipment?.organizationName || selectedShipment?.organizationName || 'Select Shipment'}
      />
      
      <main className="sim-page">
        {step === STEPS.SELECTION && (
          <div>
            <div style={{ marginBottom: '1.5rem', color: 'var(--heading)', fontSize: '1.2rem', fontWeight: 700 }}>
              Accepted Shipments Awaiting Simulation
            </div>
            {isFetching ? (
              <div className="loader-card">
                <div className="loader-icon">🔄</div>
                <div className="loader-title">Fetching shipments...</div>
              </div>
            ) : acceptedShipments.length === 0 ? (
              <div className="loader-card">
                <div className="loader-title">No Accepted Shipments Found</div>
                <div className="loader-sub">Please use the Shipment Recommendation Agent to accept a shipment.</div>
              </div>
            ) : (
              <div>
                {acceptedShipments.map(shipment => (
                  <AcceptedShipmentCard 
                    key={shipment.shipmentId}
                    shipment={shipment}
                    onGenerate={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {step === STEPS.CONFIG && selectedShipment && (
          <SimulationConfig 
            shipment={selectedShipment} 
            onGenerate={handleGenerate} 
          />
        )}

        {step === STEPS.LOADING && (
          <AIThinkingAnimation onComplete={handleAnimationComplete} />
        )}

        {step === STEPS.WORKSPACE && simState && (
          <>
            <ShipmentSummaryCard 
              shipment={simState.shipment} 
              currentStatus={simState.status} 
            />

            {isFinished ? (
              <CompletionCard shipment={simState.shipment} startTime={simState.startTime} simState={simState} />
            ) : (
              <>
                <AISimulationStrategy simulationMode={simState.simulationMode || 'Normal Journey'} />

                <div className="two-col">
                  <RouteMap 
                    srcCoords={simState.srcCoords}
                    destCoords={simState.destCoords}
                    waypoints={simState.waypoints}
                    currentLocation={simState.currentLocation}
                    source={simState.shipment.source}
                    destination={simState.shipment.destination}
                  />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                    <ProgressCard 
                      progress={simState.progress}
                      status={simState.status}
                      remainingDistance={simState.remainingDistance}
                      remainingETA={simState.remainingETA}
                    />
                    
                    <SimulationLog timeline={simState.timeline} />
                  </div>
                </div>

                <SimulationControls 
                  simulationRunning={simState.simulationRunning}
                  simulationPaused={simState.simulationPaused}
                  simulationSpeed={simState.simulationSpeed}
                  activeEvent={simState.activeEvent}
                  progress={simState.progress}
                  onStart={startSimulation}
                  onPause={pauseSimulation}
                  onResume={resumeSimulation}
                  onReset={resetSimulation}
                  onSetSpeed={setSpeed}
                  onTriggerEvent={triggerEvent}
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default RouteSimulationPage;
