import { useState } from "react";
import "./styles/App.css";
import api from "./services/api";

import Navbar        from "./components/Navbar";
import Hero          from "./components/Hero";
import SearchCard    from "./components/SearchCard";
import ShipmentCard  from "./components/ShipmentCard";
import ETACard       from "./components/ETACard";
import AISummaryCard from "./components/AISummaryCard";
import LiveRouteMap  from "./components/LiveRouteMap";
import Notification  from "./components/Notification";

function App() {
  const [shipment, setShipment] = useState(null);
  const [eta,      setEta]      = useState(null);
  const [summary,  setSummary]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const searchShipment = async (shipmentId) => {
    setLoading(true);
    setError(null);
    setShipment(null);
    setEta(null);
    setSummary("");

    try {
      const response = await api.get(`/eta/${shipmentId}`);
      setShipment(response.data.shipment);
      setEta(response.data.eta);
      setSummary(response.data.ai_summary);
    } catch {
      setError("Please enter a valid Shipment ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Navbar />

      <div className="main-content">
        <Hero />

        <SearchCard onSearch={searchShipment} loading={loading} />

        {error && (
          <Notification message={error} onClose={() => setError(null)} />
        )}

        {shipment && eta && (
          <div className="results-section">
            <div className="cards-grid">
              <ShipmentCard  shipment={shipment} />
              <ETACard       eta={eta} shipment={shipment} />
              <AISummaryCard summary={summary} />
            </div>

            <LiveRouteMap shipment={shipment} eta={eta} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
