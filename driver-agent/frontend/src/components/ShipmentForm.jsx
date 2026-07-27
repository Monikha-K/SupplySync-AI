import { useState } from "react";

const ShipmentForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    pickup_city: "",
    delivery_city: "",
    weight_kg: "",
    cargo_type: "Electronics",
    priority: "High",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "weight_kg"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="shipment-card">
      <h2>Shipment Details</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-grid">

          <div>
            <label>Pickup City</label>
            <input
              type="text"
              name="pickup_city"
              value={formData.pickup_city}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Delivery City</label>
            <input
              type="text"
              name="delivery_city"
              value={formData.delivery_city}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Weight (kg)</label>
            <input
              type="number"
              name="weight_kg"
              value={formData.weight_kg}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Cargo Type</label>

            <select
              name="cargo_type"
              value={formData.cargo_type}
              onChange={handleChange}
            >
              <option>Electronics</option>
              <option>Food</option>
              <option>Furniture</option>
              <option>Steel</option>
              <option>Chemicals</option>
              <option>Pharmaceuticals</option>
              <option>Industrial Goods</option>
              <option>Textiles</option>
              <option>FMCG</option>
            </select>
          </div>

          <div>
            <label>Priority</label>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

        </div>

        <button type="submit">
          🔍 Recommend Driver
        </button>

      </form>
    </div>
  );
};

export default ShipmentForm;