import { useState } from "react";
import "./styles/App.css";
import SearchBar from "./components/SearchBar";
import api from "./services/api";

function App() {

  const [shipment, setShipment] = useState(null);
  const [eta, setEta] = useState(null);
  const [summary, setSummary] = useState("");

  const searchShipment = async (shipmentId) => {

    try {

      const response = await api.get(`/eta/${shipmentId}`);

      setShipment(response.data.shipment);
      setEta(response.data.eta);
      setSummary(response.data.ai_summary);

    } catch {

      alert("Shipment not found!");

      setShipment(null);
      setEta(null);
      setSummary("");

    }
  };

  return (
    <div className="app">

      <h1>SupplySync AI</h1>

      <p>AI-Powered ETA Prediction Agent for Smart Logistics</p>

      <SearchBar onSearch={searchShipment} />

      {shipment && (
        <div className="result-container">

          <div className="card">

            <h2>Shipment Details</h2>

            <p><b>ID:</b> {shipment.shipmentId}</p>
            <p><b>Pickup:</b> {shipment.pickup}</p>
            <p><b>Current:</b> {shipment.currentLocation}</p>
            <p><b>Destination:</b> {shipment.destination}</p>
            <p><b>Traffic:</b> {shipment.traffic}</p>
            <p><b>Weather:</b> {shipment.weather}</p>

          </div>

          <div className="card">

            <h2>ETA Prediction</h2>

            <h3>{eta.formatted}</h3>

          </div>

          <div className="card">

            <h2>AI Summary</h2>

            <p>{summary}</p>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;