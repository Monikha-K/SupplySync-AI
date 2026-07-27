import React from "react";
import "../styles/VerificationResult.css";

const VerificationResult = ({ data }) => {
  if (!data) return null;

  const isSuccess = Boolean(data.success);
  const statusText = isSuccess ? "Success" : "Failed";
  const statusColorClass = isSuccess ? "status-green" : "status-red";

  const fields = [
    { label: "Document Type", value: data.documentType },
    { label: "Driver Name", value: data.driverName },
    { label: "Licence Number", value: data.licenseNumber },
    { label: "Issue Date", value: data.issueDate },
    { label: "Expiry Date", value: data.expiryDate },
    { label: "Vehicle Class", value: data.vehicleClass },
    { label: "Issuing Authority", value: data.issuingAuthority },
  ];

  return (
    <div className="result-card">
      <div className="result-header">
        <h3>Verification Result</h3>
        <span className={`status-badge ${statusColorClass}`}>
          {statusText}
        </span>
      </div>

      <div className="result-grid">
        {fields.map((field, idx) => (
          <div className="data-item" key={idx}>
            <span className="label">{field.label}</span>
            <span className={`value ${field.value === "Not Found" ? "value-not-found" : ""}`}>
              {field.value || "Not Found"}
            </span>
          </div>
        ))}
      </div>

      <div className="remarks-section">
        <span className="label">Original OCR Text</span>
        <p className="remarks-text" style={{ whiteSpace: 'pre-wrap' }}>
          {data.ocrText || "Not Found"}
        </p>
      </div>
    </div>
  );
};

export default VerificationResult;