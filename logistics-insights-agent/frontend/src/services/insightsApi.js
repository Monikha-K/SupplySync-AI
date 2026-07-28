import axios from 'axios';

const API_BASE_URL = 'http://localhost:8004/api/insights';

/**
 * Fetch all completed shipments (lightweight summaries).
 */
export const getCompletedShipments = async () => {
  const response = await axios.get(`${API_BASE_URL}/completed`);
  return response.data;
};

/**
 * Fetch full logistics report for a specific shipment.
 */
export const getShipmentReport = async (shipmentId) => {
  const response = await axios.get(`${API_BASE_URL}/report/${shipmentId}`);
  return response.data;
};
