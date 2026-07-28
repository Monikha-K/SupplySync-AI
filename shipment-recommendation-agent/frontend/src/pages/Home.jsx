import React, { useState, useEffect } from 'react';
import RouteSelector from '../components/RouteSelector';
import AIThinking from '../components/AIThinking';
import RecommendationResult from '../components/RecommendationResult';
import AcceptanceSummary from '../components/AcceptanceSummary';
import { fetchSources, fetchDestinations, fetchShipments, acceptShipment } from '../services/shipmentService';

// Page states
const STATE = {
  SELECT: 'select',
  THINKING: 'thinking',
  RESULT: 'result',
  ACCEPTED: 'accepted',
};

const Home = () => {
  const [pageState, setPageState] = useState(STATE.SELECT);
  const [sources, setSources] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [recommendedShipment, setRecommendedShipment] = useState(null);
  const [otherShipments, setOtherShipments] = useState([]);
  const [acceptedData, setAcceptedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [srcs, dests] = await Promise.all([fetchSources(), fetchDestinations()]);
        setSources(srcs);
        setDestinations(dests);
      } catch (e) {
        console.error('Failed to load locations', e);
      }
    };
    load();
  }, []);

  const handleSearch = async (source, destination) => {
    setPageState(STATE.THINKING);
    setError(null);
    try {
      const data = await fetchShipments(source, destination);
      setRecommendedShipment(data.recommendedShipment);
      setOtherShipments(data.otherShipments || []);
      setPageState(STATE.RESULT);
    } catch (e) {
      setError('Failed to fetch shipments. Please try again.');
      setPageState(STATE.SELECT);
    }
  };

  const handleAccept = async (shipment) => {
    await acceptShipment(shipment.shipmentId);
    setAcceptedData({
      ...shipment,
      acceptedAt: new Date().toLocaleString('en-IN'),
    });
    setPageState(STATE.ACCEPTED);
  };

  const handleReset = () => {
    setPageState(STATE.SELECT);
    setRecommendedShipment(null);
    setOtherShipments([]);
    setAcceptedData(null);
    setError(null);
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <h2>Shipment Recommendation</h2>
        <p>Select a source and destination. The AI Agent will find and recommend the best available shipment.</p>
      </section>

      <section className="upload-section">
        {error && <div className="error-message">{error}</div>}

        {pageState === STATE.SELECT && (
          <RouteSelector
            sources={sources}
            destinations={destinations}
            onSearch={handleSearch}
          />
        )}

        {pageState === STATE.THINKING && <AIThinking />}

        {pageState === STATE.RESULT && (
          <RecommendationResult
            recommendedShipment={recommendedShipment}
            otherShipments={otherShipments}
            onAccept={handleAccept}
            onReset={handleReset}
          />
        )}

        {pageState === STATE.ACCEPTED && (
          <AcceptanceSummary
            shipment={acceptedData}
            onReset={handleReset}
          />
        )}
      </section>
    </div>
  );
};

export default Home;
