import axios from 'axios';

const API_URL = 'http://localhost:8000/api/shipments';

export const fetchSources = async () => {
  const response = await axios.get(`${API_URL}/sources`);
  return response.data;
};

export const fetchDestinations = async () => {
  const response = await axios.get(`${API_URL}/destinations`);
  return response.data;
};

export const fetchShipments = async (source, destination) => {
  const response = await axios.post(`${API_URL}/recommend`, {
    source,
    destination
  });
  return response.data;
};

export const acceptShipment = async (shipmentId, recommendationData = {}) => {
  const response = await axios.put(`${API_URL}/${shipmentId}/accept`, recommendationData);
  return response.data;
};
