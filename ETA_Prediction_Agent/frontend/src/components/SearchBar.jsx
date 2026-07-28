import { useState } from "react";
import "../styles/SearchBar.css";

function SearchBar({ onSearch }) {
  const [shipmentId, setShipmentId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!shipmentId.trim()) {
      alert("Please enter a Shipment ID");
      return;
    }

    onSearch(shipmentId.trim());
  };

  return (
    <form className="search-container" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter Shipment ID (e.g. SHP000001)"
        value={shipmentId}
        onChange={(e) => setShipmentId(e.target.value)}
      />

      <button type="submit">Predict ETA</button>
    </form>
  );
}

export default SearchBar;