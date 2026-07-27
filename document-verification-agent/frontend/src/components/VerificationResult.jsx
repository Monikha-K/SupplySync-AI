import React from "react";
import "../styles/VerificationResult.css";

const VerificationResult = ({ data }) => {
  if (!data) return null;

  const isSuccess = Boolean(data.success);
  const statusText = isSuccess ? "Success" : "Failed";
  const statusColorClass = isSuccess ? "status-green" : "status-red";

  const fields = [
    { label: "Issuing Authority", value: data.issuingAuthority },
    { label: "Document Type", value: data.documentType },
    { label: "Document Number", value: data.documentNumber },
    { label: "Full Name", value: data.fullName },
    { label: "Date of Birth", value: data.dateOfBirth },
    { label: "Issue Date", value: data.issueDate },
    { label: "Expiry Date", value: data.expiryDate },
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