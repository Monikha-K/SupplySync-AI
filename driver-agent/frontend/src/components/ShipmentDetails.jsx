const ShipmentDetails = ({ assignment }) => {
  const rows = [
    { label: "📋 Shipment ID",       value: assignment.shipment_id },
    { label: "📍 Pickup City",        value: assignment.pickup_city },
    { label: "🏁 Drop City",          value: assignment.drop_city },
    { label: "📦 Cargo Type",         value: assignment.cargo_type },
    { label: "⚖️ Weight",             value: `${assignment.weight} kg` },
    { label: "🚨 Priority",           value: assignment.priority },
    { label: "🧑‍✈️ Assigned Driver",  value: assignment.driver_name },
    { label: "🪪 Driver ID",          value: assignment.driver_id },
    { label: "✅ Status",             value: "Assigned" },
    { label: "🕐 Assigned At",        value: assignment.assigned_at },
  ];

  return (
    <>
      <div className="assignment-banner">
        ✅ Driver successfully assigned to this shipment.
      </div>

      <div className="table-card">
        <h2>Shipment Details</h2>

        <div className="shipment-details-grid">
          {rows.map(({ label, value }) => (
            <div className="sd-row" key={label}>
              <span className="sd-label">{label}</span>
              <span className={`sd-value${label.includes("Status") ? " sd-status" : ""}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ShipmentDetails;
