import { useState, useEffect, useRef, useCallback } from 'react';
import { getStatusFromProgress, getStatusIcon } from '../utils/statusManager.js';
import { calcRemainingDistance, interpolatePosition } from '../utils/progressCalculator.js';
import { calcRemainingETA } from '../utils/etaCalculator.js';
import { BASE_PROGRESS_RATE, SPEED_MULTIPLIERS, SIM_EVENTS } from '../constants/simulationEvents.js';
import { SIM_STATUS } from '../constants/simulationStatus.js';
import * as api from '../services/simulationApi';

const TICK_MS = 500;

export function useSimulation() {
  const [simState, setSimState] = useState(null);
  const tickRef = useRef(null);

  const addTimelineEntry = useCallback((message, icon) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setSimState(prev => prev ? {
      ...prev,
      timeline: [...prev.timeline, { time, message, icon }],
    } : null);
  }, []);

  const loadSimulation = useCallback((simulationDoc) => {
    let initialSpeed = '1x';
    if (simulationDoc.simulationSpeedStr === 'Fast') initialSpeed = '2x';
    if (simulationDoc.simulationSpeedStr === 'Very Fast') initialSpeed = '4x';

    setSimState({
      ...simulationDoc,
      simulationRunning: false,
      simulationPaused: false,
      simulationSpeed: initialSpeed,
      simulationMode: simulationDoc.simulationMode || 'Normal Journey',
      checkpointInterval: simulationDoc.checkpointInterval || '25 km',
      animationSpeed: simulationDoc.animationSpeed || 'Medium',
      modeTriggered: false,
      completionSaved: false,
      completedDoc: null,
      timeline: [],
      startTime: null,
      srcCoords: simulationDoc.routeCoordinates[0],
      destCoords: simulationDoc.routeCoordinates[simulationDoc.routeCoordinates.length - 1],
      waypoints: simulationDoc.routeCoordinates,
      currentLocation: [
        simulationDoc.currentLocation.lat,
        simulationDoc.currentLocation.lng
      ],
      shipment: {
        shipmentId: simulationDoc.shipmentId,
        organizationName: simulationDoc.organizationName,
        source: simulationDoc.source,
        destination: simulationDoc.destination,
        distanceKm: simulationDoc.distanceKm,
        averageETAHours: simulationDoc.averageETAHours
      }
    });
  }, []);

  const triggerEvent = useCallback(async (eventId) => {
    if (!simState) return;
    try {
      await api.triggerSimulationEvent(simState.simulationId, eventId);
      const ev = SIM_EVENTS[eventId];
      setSimState(prev => ({ ...prev, activeEvent: eventId }));
      addTimelineEntry(`${ev.label}: ${ev.description}`, ev.icon);
      
      setTimeout(async () => {
        try {
          setSimState(prev => {
            if (prev.activeEvent === eventId) {
              addTimelineEntry(`${ev.label} cleared. Resuming normal speed.`, '✅');
              return { ...prev, activeEvent: null };
            }
            return prev;
          });
        } catch(e) {}
      }, 8000);
    } catch (e) {
      console.error(e);
    }
  }, [simState, addTimelineEntry]);

  const tick = useCallback(() => {
    setSimState(prev => {
      if (!prev || !prev.simulationRunning || prev.simulationPaused) return prev;
      if (prev.progress >= 100) return prev;

      let modeTriggered = prev.modeTriggered;
      let newPaused = prev.simulationPaused;

      // Handle Automatic Mode Injections
      if (prev.progress > 40 && prev.progress < 50 && !prev.modeTriggered) {
        if (prev.simulationMode === 'Road Block') {
          modeTriggered = true;
          triggerEvent('ROAD_BLOCK');
          newPaused = true; // Auto-pause for roadblock
          setTimeout(() => resumeSimulation(), 5000); // auto-resume after 5s
        }
        if (prev.simulationMode === 'Vehicle Breakdown') {
          modeTriggered = true;
          triggerEvent('VEHICLE_BREAKDOWN');
          newPaused = true;
          setTimeout(() => resumeSimulation(), 5000);
        }
      }

      const eventMod = prev.activeEvent ? SIM_EVENTS[prev.activeEvent].speedMultiplier : 1;
      const speedFactor = SPEED_MULTIPLIERS[prev.simulationSpeed] ?? 1;
      
      // If paused due to event, stop progressing
      if (newPaused || eventMod === 0) {
        return { ...prev, modeTriggered, simulationPaused: newPaused };
      }

      const increment = BASE_PROGRESS_RATE * speedFactor * eventMod;
      const newProgress = Math.min(100, prev.progress + increment);
      const newStatus = getStatusFromProgress(newProgress);
      const remaining = calcRemainingDistance(prev.distanceKm, newProgress);
      const etaMult = prev.activeEvent ? SIM_EVENTS[prev.activeEvent].etaMultiplier : 1;
      const newETA = calcRemainingETA(prev.averageETAHours, newProgress, etaMult);
      const newLocation = interpolatePosition(prev.waypoints, newProgress / 100);

      const statusChanged = newStatus !== prev.status;
      const newTimeline = statusChanged
        ? [...prev.timeline, {
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            message: newStatus,
            icon: getStatusIcon(newStatus),
          }]
        : prev.timeline;

      return {
        ...prev,
        progress: newProgress,
        status: newStatus,
        remainingDistance: remaining,
        remainingETA: newETA,
        currentLocation: newLocation,
        timeline: newTimeline,
        simulationRunning: newProgress < 100,
        modeTriggered,
        simulationPaused: newPaused
      };
    });
  }, [triggerEvent]);

  useEffect(() => {
    if (simState?.simulationRunning && !simState?.simulationPaused) {
      tickRef.current = setInterval(tick, TICK_MS);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [simState?.simulationRunning, simState?.simulationPaused, simState?.simulationSpeed, tick]);

  useEffect(() => {
    if (simState && simState.progress >= 100 && !simState.completionSaved) {
      setSimState(prev => prev ? { ...prev, completionSaved: true } : prev);
      api.completeSimulation(simState.simulationId, {
        simulationSpeed: simState.simulationSpeed
      })
      .then(completedDoc => {
        setSimState(prev => prev ? {
          ...prev,
          completedDoc,
          performanceScore: completedDoc.performanceScore,
          delayMinutes: completedDoc.delayMinutes,
          actualTravelTime: completedDoc.actualTravelTime,
          status: 'Completed'
        } : prev);
      })
      .catch(err => {
        console.error('Failed to save completion data:', err);
      });
    }
  }, [simState?.progress, simState?.completionSaved, simState?.simulationId, simState?.simulationSpeed]);

  const startSimulation = useCallback(async () => {
    if (!simState) return;
    try {
      await api.markSimulationStarted(simState.simulationId);
      setSimState(prev => ({
        ...prev,
        simulationRunning: true,
        simulationPaused: false,
        startTime: prev.startTime ?? new Date().toISOString(),
      }));
      addTimelineEntry('Simulation Started', '🚀');

      // Immediate triggers based on mode
      if (simState.simulationMode === 'Heavy Traffic') {
        setTimeout(() => triggerEvent('TRAFFIC'), 2000);
      } else if (simState.simulationMode === 'Heavy Rain') {
        setTimeout(() => triggerEvent('HEAVY_RAIN'), 2000);
      }
      
    } catch (e) {
      console.error(e);
    }
  }, [simState, addTimelineEntry, triggerEvent]);

  const pauseSimulation = useCallback(async () => {
    if (!simState) return;
    try {
      await api.pauseSimulation(simState.simulationId);
      setSimState(prev => ({ ...prev, simulationPaused: true }));
      addTimelineEntry('Simulation Paused', '⏸️');
    } catch (e) {
      console.error(e);
    }
  }, [simState, addTimelineEntry]);

  const resumeSimulation = useCallback(async () => {
    if (!simState) return;
    try {
      await api.resumeSimulation(simState.simulationId);
      setSimState(prev => ({ ...prev, simulationPaused: false }));
      addTimelineEntry('Simulation Resumed', '▶️');
    } catch (e) {
      console.error(e);
    }
  }, [simState, addTimelineEntry]);

  const resetSimulation = useCallback(async () => {
    if (!simState) return;
    try {
      clearInterval(tickRef.current);
      await api.resetSimulation(simState.simulationId);
      const updatedDoc = await api.getSimulationState(simState.simulationId);
      loadSimulation(updatedDoc);
    } catch (e) {
      console.error(e);
    }
  }, [simState, loadSimulation]);

  const setSpeed = useCallback((speed) => {
    setSimState(prev => ({ ...prev, simulationSpeed: speed }));
  }, []);

  return {
    simState,
    loadSimulation,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    setSpeed,
    triggerEvent,
  };
}
