import React, { useState, useEffect } from 'react';
import RouteSelector from '../components/RouteSelector';
import AIThinking from '../components/AIThinking';
import RecommendationDashboard from '../components/RecommendationDashboard';
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
  const [recommendationData, setRecommendationData] = useState(null);
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
      // Wait for AI Thinking animation to complete (8 steps * 600ms = ~4800ms)
      setTimeout(() => {
        setRecommendationData(data);
        setPageState(STATE.RESULT);
      }, 5000);
    } catch (e) {
      setError('Failed to fetch shipments. Please try again.');
      setPageState(STATE.SELECT);
    }
  };

  const handleAccept = async (shipment) => {
    // Pass recommendation explainability data
    const recData = {
      recommendationScore: shipment.recommendationScore,
      confidenceScore: shipment.confidenceScore,
      decisionReasons: shipment.decisionReasons,
      comparisonRank: shipment.comparisonRank || 1,
    };
    
    await acceptShipment(shipment.shipmentId, recData);
    setAcceptedData({
      ...shipment,
      acceptedAt: new Date().toLocaleString('en-IN'),
    });
    setPageState(STATE.ACCEPTED);
  };

  const handleReset = () => {
    setPageState(STATE.SELECT);
    setRecommendationData(null);
    setAcceptedData(null);
    setError(null);
  };

  return (
    <div className="home-page" style={{ maxWidth: '1200px' }}>
      <section className="hero-section">
        <h2>Explainable AI Shipment Recommendation</h2>
        <p>Select a route. The AI will evaluate, score, compare, and explain its recommendation.</p>
      </section>

      <section className="upload-section" style={{ maxWidth: '100%' }}>
        {error && <div className="error-message">{error}</div>}

        {pageState === STATE.SELECT && (
          <RouteSelector
            sources={sources}
            destinations={destinations}
            onSearch={handleSearch}
          />
        )}

        {pageState === STATE.THINKING && <AIThinking />}

        {pageState === STATE.RESULT && recommendationData && (
          <RecommendationDashboard
            data={recommendationData}
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
