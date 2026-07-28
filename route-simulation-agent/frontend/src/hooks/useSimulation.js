/**
 * useSimulation.js
 * Central React hook managing all simulation state, tick logic,
 * event handling, and timeline updates.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { buildSimulationFromShipment, getDemoShipment } from '../services/simulationService.js';
import { getStatusFromProgress, getStatusIcon } from '../utils/statusManager.js';
import { calcRemainingDistance, interpolatePosition } from '../utils/progressCalculator.js';
import { calcRemainingETA } from '../utils/etaCalculator.js';
import { BASE_PROGRESS_RATE, SPEED_MULTIPLIERS, SIM_EVENTS } from '../constants/simulationEvents.js';
import { SIM_STATUS } from '../constants/simulationStatus.js';

// Tick interval in milliseconds
const TICK_MS = 500;

export function useSimulation(shipmentProp) {
  const shipment = shipmentProp ?? getDemoShipment();

  // Initialise from shipment data
  const [simState, setSimState] = useState(() => buildSimulationFromShipment(shipment));
  const tickRef  = useRef(null);

  // Derived helpers (stable references)
  const addTimelineEntry = useCallback((message, icon) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setSimState(prev => ({
      ...prev,
      timeline: [...prev.timeline, { time, message, icon }],
    }));
  }, []);

  // ── Tick ─────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setSimState(prev => {
      if (!prev.simulationRunning || prev.simulationPaused) return prev;
      if (prev.progress >= 100) return prev;

      const eventMod    = prev.activeEvent ? SIM_EVENTS[prev.activeEvent].speedMultiplier : 1;
      const speedFactor = SPEED_MULTIPLIERS[prev.simulationSpeed] ?? 1;
      // If vehicle breakdown, no progress
      if (eventMod === 0) return prev;

      const increment       = BASE_PROGRESS_RATE * speedFactor * eventMod;
      const newProgress     = Math.min(100, prev.progress + increment);
      const newStatus       = getStatusFromProgress(newProgress);
      const remaining       = calcRemainingDistance(prev.shipment.distanceKm, newProgress);
      const etaMult         = prev.activeEvent ? SIM_EVENTS[prev.activeEvent].etaMultiplier : 1;
      const newETA          = calcRemainingETA(prev.shipment.averageETAHours, newProgress, etaMult);
      const newLocation     = interpolatePosition(prev.waypoints, newProgress / 100);

      // Build timeline entry when status changes
      const statusChanged = newStatus !== prev.status;
      const newTimeline   = statusChanged
        ? [...prev.timeline, {
            time:    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            message: newStatus,
            icon:    getStatusIcon(newStatus),
          }]
        : prev.timeline;

      return {
        ...prev,
        progress:          newProgress,
        status:            newStatus,
        remainingDistance: remaining,
        remainingETA:      newETA,
        currentLocation:   newLocation,
        timeline:          newTimeline,
        simulationRunning: newProgress < 100,
      };
    });
  }, []);

  // ── Timer management ────────────────────────────────────────────────────
  useEffect(() => {
    if (simState.simulationRunning && !simState.simulationPaused) {
      tickRef.current = setInterval(tick, TICK_MS);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [simState.simulationRunning, simState.simulationPaused, simState.simulationSpeed, tick]);

  // ── Controls ────────────────────────────────────────────────────────────
  const startSimulation = useCallback(() => {
    setSimState(prev => ({
      ...prev,
      simulationRunning: true,
      simulationPaused:  false,
      startTime:         prev.startTime ?? new Date().toISOString(),
    }));
    addTimelineEntry('Simulation Started', '🚀');
  }, [addTimelineEntry]);

  const pauseSimulation = useCallback(() => {
    setSimState(prev => ({ ...prev, simulationPaused: true }));
    addTimelineEntry('Simulation Paused', '⏸️');
  }, [addTimelineEntry]);

  const resumeSimulation = useCallback(() => {
    setSimState(prev => ({ ...prev, simulationPaused: false }));
    addTimelineEntry('Simulation Resumed', '▶️');
  }, [addTimelineEntry]);

  const resetSimulation = useCallback(() => {
    clearInterval(tickRef.current);
    setSimState(buildSimulationFromShipment(shipment));
  }, [shipment]);

  const setSpeed = useCallback((speed) => {
    setSimState(prev => ({ ...prev, simulationSpeed: speed }));
  }, []);

  // ── Events ───────────────────────────────────────────────────────────────
  const triggerEvent = useCallback((eventId) => {
    const ev = SIM_EVENTS[eventId];
    if (!ev) return;
    setSimState(prev => ({ ...prev, activeEvent: eventId }));
    addTimelineEntry(`${ev.label}: ${ev.description}`, ev.icon);
    // Auto-clear event after 8 seconds (16 ticks)
    setTimeout(() => {
      setSimState(prev => prev.activeEvent === eventId ? { ...prev, activeEvent: null } : prev);
      addTimelineEntry(`${ev.label} cleared. Resuming normal speed.`, '✅');
    }, 8000);
  }, [addTimelineEntry]);

  return {
    simState,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    setSpeed,
    triggerEvent,
  };
}
