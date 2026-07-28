import { useState } from "react";
import "./RouteForm.css";
import { FaRoute } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import API from "../services/api";

function RouteForm({ setRouteData }) {
  const [pickupCity, setPickupCity] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [priority, setPriority] = useState("High");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pickupCity || !deliveryCity) {
      alert("Please enter both Pickup and Delivery cities.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/recommend-route", {
        pickup_city: pickupCity,
        delivery_city: deliveryCity,
        priority: priority,
      });

      setRouteData(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to optimize route.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <div className="header-icon">
          <FaRoute />
        </div>

        <h2>Route Details</h2>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label>Pickup City</label>

          <input
            type="text"
            placeholder="Enter Pickup City"
            value={pickupCity}
            onChange={(e) => setPickupCity(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Delivery City</label>

          <input
            type="text"
            placeholder="Enter Delivery City"
            value={deliveryCity}
            onChange={(e) => setDeliveryCity(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Priority</label>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <button
        className="route-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        <FiSearch />

        {loading ? "Optimizing..." : "Optimize Route"}
      </button>
    </div>
  );
}

export default RouteForm;