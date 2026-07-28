import React from 'react';
import AgentHeader from '../components/Header/AgentHeader';
import ShipmentSummaryCard from '../components/Shipment/ShipmentSummaryCard';
import RouteMap from '../components/Map/RouteMap';
import ProgressCard from '../components/Simulation/ProgressCard';
import SimulationControls from '../components/Simulation/SimulationControls';
import SimulationLog from '../components/Simulation/SimulationLog';
import CompletionCard from '../components/Simulation/CompletionCard';
import { useSimulation } from '../hooks/useSimulation';

const RouteSimulationPage = () => {
  const {
    simState,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    setSpeed,
    triggerEvent
  } = useSimulation();

  const isFinished = simState.progress >= 100;

  return (
    <div className="app-container">
      <AgentHeader 
        shipmentId={simState.shipment.shipmentId}
        organizationName={simState.shipment.organizationName}
      />
      
      <main className="sim-page">
        {/* Top summary row */}
        <ShipmentSummaryCard 
          shipment={simState.shipment} 
          currentStatus={simState.status} 
        />

        {isFinished ? (
          <CompletionCard shipment={simState.shipment} startTime={simState.startTime} />
        ) : (
          <>
            {/* Map and Progress row */}
            <div className="two-col">
              <RouteMap 
                srcCoords={simState.srcCoords}
                destCoords={simState.destCoords}
                waypoints={simState.waypoints}
                currentLocation={simState.currentLocation}
                source={simState.shipment.source}
                destination={simState.shipment.destination}
              />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                <ProgressCard 
                  progress={simState.progress}
                  status={simState.status}
                  remainingDistance={simState.remainingDistance}
                  remainingETA={simState.remainingETA}
                />
                
                <SimulationLog timeline={simState.timeline} />
              </div>
            </div>

            {/* Controls row */}
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
      </main>
    </div>
  );
};

export default RouteSimulationPage;
