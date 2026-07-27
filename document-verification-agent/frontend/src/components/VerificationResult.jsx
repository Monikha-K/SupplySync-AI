import React, { useState } from "react";
import "../styles/VerificationResult.css";

const VerificationResult = ({ data }) => {
  const [showOCR, setShowOCR] = useState(false);

  if (!data) return null;

  const isSuccess = Boolean(data.success);
  const statusText = isSuccess ? "Success" : "Failed";
  const statusColorClass = isSuccess ? "status-green" : "status-red";

  const isRcBook = data.documentType === 'rc_book';
  const extractedData = data.data || {};

  const fields = isRcBook
    ? [
        { label: "Registration Number", value: extractedData.registrationNumber },
        { label: "Chassis Number", value: extractedData.chassisNumber },
        { label: "Engine Number", value: extractedData.engineNumber },
        { label: "Maker's Name", value: extractedData.makersName },
        { label: "Model Name", value: extractedData.modelName },
        { label: "Vehicle Class", value: extractedData.vehicleClass },
      ]
    : [
        { label: "Issuing Authority", value: extractedData.issuingAuthority },
        { label: "Document Type", value: extractedData.documentType },
        { label: "Document Number", value: extractedData.documentNumber },
        { label: "Full Name", value: extractedData.fullName },
        { label: "Date of Birth", value: extractedData.dateOfBirth },
        { label: "Issue Date", value: extractedData.issueDate },
        { label: "Expiry Date", value: extractedData.expiryDate },
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

      <div className="ocr-collapsible-section" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <button
          className="ocr-toggle-btn"
          onClick={() => setShowOCR(!showOCR)}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-color)',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0'
          }}
        >
          {showOCR ? "▼ Hide OCR Text" : "▶ Show OCR Text"}
        </button>

        <div className={`ocr-content-wrapper ${showOCR ? "expanded" : "collapsed"}`}>
          {showOCR && (
            <div className="ocr-card">
              <span className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Original OCR Text</span>
              <p className="ocr-text-body">
                {data.ocrText || "Not Found"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationResult;