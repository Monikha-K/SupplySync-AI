import { useState } from 'react';
import { fetchShipments, acceptShipment } from '../services/shipmentService';

export const useShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchShipments = async (source, destination) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const data = await fetchShipments(source, destination);
      setShipments(data);
    } catch (err) {
      setError('Failed to fetch shipments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (shipmentId) => {
    try {
      await acceptShipment(shipmentId);
      alert(`Successfully accepted shipment: ${shipmentId}`);
      // Remove accepted shipment from the list
      setShipments(prev => prev.filter(s => s.shipmentId !== shipmentId));
    } catch (err) {
      alert('Failed to accept shipment.');
    }
  };

  const recommendedShipment = shipments.length > 0 ? shipments[0] : null;
  const otherShipments = shipments.length > 1 ? shipments.slice(1) : [];

  return {
    isLoading,
    error,
    hasSearched,
    recommendedShipment,
    otherShipments,
    searchShipments,
    handleAccept
  };
};