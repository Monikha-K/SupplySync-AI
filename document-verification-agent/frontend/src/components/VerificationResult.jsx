import React, { useState } from "react";
import "../styles/VerificationResult.css";

const VerificationResult = ({ data }) => {
  const [showOCR, setShowOCR] = useState(false);

  if (!data) return null;

  const isSuccess = Boolean(data.success);
  const statusText = isSuccess ? "Success" : "Failed";
  const statusColorClass = isSuccess ? "status-green" : "status-red";
  const statusIcon = isSuccess ? "✅" : "❌";

  const isRcBook = data.documentType === 'rc_book';
  const docTypeName = isRcBook ? "RC Book" : "Driving Licence";
  const ocrStatus = isSuccess ? "Completed" : "Failed";

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

  // Calculate dynamic count of successfully extracted fields vs total fields
  const totalFields = fields.length;
  const validFieldsCount = fields.filter(f => f.value && f.value !== "Not Found").length;
  const fieldsExtractedText = `${validFieldsCount} / ${totalFields}`;

  return (
    <div className="result-card">
      {/* Top Header */}
      <div className="result-header">
        <h3>Verification Result</h3>
        <span className={`status-badge ${statusColorClass}`}>
          {statusIcon} {statusText}
        </span>
      </div>

      {/* Verification Dashboard Summary Card */}
      <div className="dashboard-summary-card">
        <div className="summary-item">
          <span className="summary-label">Document Type</span>
          <span className="summary-value">{docTypeName}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">OCR Status</span>
          <span className="summary-value">{ocrStatus}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Fields Extracted</span>
          <span className="summary-value">{fieldsExtractedText}</span>
        </div>
      </div>

      {/* Extracted Fields Section */}
      <div className="extracted-fields-section">
        <h4 className="section-title">Extracted Details</h4>
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
      </div>

      {/* Collapsible Original OCR Text Section */}
      <div className="ocr-collapsible-section">
        <button
          className="ocr-toggle-btn"
          onClick={() => setShowOCR(!showOCR)}
          type="button"
        >
          {showOCR ? "▼ Hide Original OCR Text" : "▶ Show Original OCR Text"}
        </button>

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
  );
};

export default VerificationResult;