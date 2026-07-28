import { useState, useEffect } from 'react';
import { fetchSources, fetchDestinations, fetchShipments, acceptShipment } from '../services/shipmentService';

export const useShipments = () => {
  const [sources, setSources] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [shipmentsData, setShipmentsData] = useState({ recommendedShipment: null, otherShipments: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const [srcs, dests] = await Promise.all([
          fetchSources(),
          fetchDestinations()
        ]);
        setSources(srcs);
        setDestinations(dests);
      } catch (err) {
        console.error("Failed to load locations", err);
      }
    };
    loadLocations();
  }, []);

  const searchShipments = async (source, destination) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const data = await fetchShipments(source, destination);
      setShipmentsData(data);
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
      
      setShipmentsData(prev => {
        if (prev.recommendedShipment?.shipmentId === shipmentId) {
          return { ...prev, recommendedShipment: null };
        }
        return {
          ...prev,
          otherShipments: prev.otherShipments.filter(s => s.shipmentId !== shipmentId)
        };
      });
    } catch (err) {
      alert('Failed to accept shipment.');
    }
  };

  return {
    sources,
    destinations,
    isLoading,
    error,
    hasSearched,
    recommendedShipment: shipmentsData.recommendedShipment,
    otherShipments: shipmentsData.otherShipments,
    searchShipments,
    handleAccept
  };
};
