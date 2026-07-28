import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/simulations';

export const fetchAcceptedShipments = async () => {
  const response = await axios.get(`${API_BASE_URL}/accepted-shipments`);
  return response.data;
};

export const startSimulation = async (shipmentId, config = {}) => {
  const response = await axios.post(`${API_BASE_URL}/start`, { shipmentId, ...config });
  return response.data;
};

export const getSimulationState = async (simulationId) => {
  const response = await axios.get(`${API_BASE_URL}/${simulationId}`);
  return response.data;
};

export const markSimulationStarted = async (simulationId) => {
  const response = await axios.post(`${API_BASE_URL}/${simulationId}/start`);
  return response.data;
};

export const pauseSimulation = async (simulationId) => {
  const response = await axios.post(`${API_BASE_URL}/${simulationId}/pause`);
  return response.data;
};

export const resumeSimulation = async (simulationId) => {
  const response = await axios.post(`${API_BASE_URL}/${simulationId}/resume`);
  return response.data;
};

export const resetSimulation = async (simulationId) => {
  const response = await axios.post(`${API_BASE_URL}/${simulationId}/reset`);
  return response.data;
};

export const triggerSimulationEvent = async (simulationId, eventName) => {
  const response = await axios.post(`${API_BASE_URL}/${simulationId}/event`, { event: eventName });
  return response.data;
};

export const completeSimulation = async (simulationId, payload = {}) => {
  const response = await axios.post(`${API_BASE_URL}/${simulationId}/complete`, payload);
  return response.data;
};

export const fetchCompletedSimulations = async () => {
  const response = await axios.get(`${API_BASE_URL}/completed`);
  return response.data;
};

export const fetchCompletedSimulationByShipment = async (shipmentId) => {
  const response = await axios.get(`${API_BASE_URL}/completed/${shipmentId}`);
  return response.data;
};

