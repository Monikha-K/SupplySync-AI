import React from "react";
import "../styles/VerificationResult.css";

const VerificationResult = ({ data }) => {
  // Don't render anything if no data is available
  if (!data) return null;

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "verified":
        return "status-green";
      case "rejected":
        return "status-red";
      case "pending":
        return "status-amber";
      default:
        return "status-amber";
    }
  };

  return (
    <div className="result-card">
      <div className="result-header">
        <h3>Verification Result</h3>

        <span className={`status-badge ${getStatusColor(data.status)}`}>
          {data.status || "Pending"}
        </span>
      </div>

      <div className="result-grid">
        <div className="data-item">
          <span className="label">Document Type</span>
          <span className="value">
            {data.documentType || "N/A"}
          </span>
        </div>

        <div className="data-item">
          <span className="label">Driver Name</span>
          <span className="value">
            {data.driverName || "N/A"}
          </span>
        </div>

        <div className="data-item">
          <span className="label">License Number</span>
          <span className="value">
            {data.licenseNumber || "N/A"}
          </span>
        </div>

        <div className="data-item">
          <span className="label">Expiry Date</span>
          <span className="value">
            {data.expiryDate || "N/A"}
          </span>
        </div>
      </div>

      <div className="remarks-section">
        <span className="label">Remarks</span>

        <p className="remarks-text">
          {data.remarks || "No remarks available."}
        </p>
      </div>
    </div>
  );
};

export default VerificationResult;