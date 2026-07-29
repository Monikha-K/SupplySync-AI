import { useState } from "react";
import "../styles/SearchCard.css";

function SearchCard({ onSearch, loading }) {
  const [shipmentId, setShipmentId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shipmentId.trim()) return;
    onSearch(shipmentId.trim());
  };

  return (
    <div className="search-wrapper">
      <div className="search-card">
        <div className="search-card-header">
          <span className="icon">📦</span>
          <h2>Search Shipment</h2>
        </div>
        <form className="search-input-row" onSubmit={handleSubmit}>
          <input
            className="search-input"
            type="text"
            placeholder="Enter Shipment ID (Example: SHP000001)"
            value={shipmentId}
            onChange={(e) => setShipmentId(e.target.value)}
            disabled={loading}
          />
          <button className="predict-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-sm" />
                Predicting ETA...
              </>
            ) : (
              "Predict ETA"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SearchCard;
