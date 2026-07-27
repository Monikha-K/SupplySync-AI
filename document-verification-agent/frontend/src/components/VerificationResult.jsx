import React, { useState } from "react";
import "../styles/VerificationResult.css";

// Helper: score pill color
const getScoreColor = (score) => {
  if (score >= 90) return "#22C55E";
  if (score >= 75) return "#84CC16";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#EF4444";
};

const getStatusColors = (status) => {
  switch ((status || "").toLowerCase()) {
    case "verified": return { bg: "rgba(34,197,94,0.15)", border: "#22C55E", text: "#22C55E", badge: "#22C55E" };
    case "needs review": return { bg: "rgba(245,158,11,0.15)", border: "#F59E0B", text: "#F59E0B", badge: "#F59E0B" };
    case "rejected": return { bg: "rgba(239,68,68,0.15)", border: "#EF4444", text: "#EF4444", badge: "#EF4444" };
    default: return { bg: "rgba(100,116,139,0.15)", border: "#64748B", text: "#94A3B8", badge: "#64748B" };
  }
};

const getCheckStatus = (status) => {
  switch ((status || "").toLowerCase()) {
    case "passed": return { icon: "✔", color: "#22C55E" };
    case "failed": return { icon: "✘", color: "#EF4444" };
    case "warning": return { icon: "⚠", color: "#F59E0B" };
    default: return { icon: "–", color: "#94A3B8" };
  }
};

const getAIDecision = (status) => {
  switch ((status || "").toLowerCase()) {
    case "verified": return { label: "APPROVED", color: "#22C55E", bg: "rgba(34,197,94,0.1)" };
    case "needs review": return { label: "MANUAL REVIEW REQUIRED", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" };
    case "rejected": return { label: "REJECTED", color: "#EF4444", bg: "rgba(239,68,68,0.1)" };
    default: return { label: "VERIFICATION UNAVAILABLE", color: "#94A3B8", bg: "rgba(100,116,139,0.1)" };
  }
};

// Circular Trust Score Ring
const TrustScoreRing = ({ score }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="trust-ring-container">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1E293B" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="trust-ring-label">
        <span className="trust-score-number" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
};

// Individual Analysis Check Row
const AnalysisRow = ({ label, checkData }) => {
  if (!checkData) return null;
  const { icon, color } = getCheckStatus(checkData.status);
  const barColor = getScoreColor(checkData.score || 0);

  return (
    <div className="analysis-row">
      <div className="analysis-row-top">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color, fontWeight: "bold", fontSize: "1rem" }}>{icon}</span>
          <span className="analysis-label">{label}</span>
        </div>
        <span className="analysis-score" style={{ color: barColor }}>{checkData.score}%</span>
      </div>
      <div className="analysis-bar-track">
        <div className="analysis-bar-fill" style={{ width: `${checkData.score}%`, background: barColor }} />
      </div>
      <p className="analysis-remarks">{checkData.remarks}</p>
    </div>
  );
};

const VerificationResult = ({ data }) => {
  const [showOCR, setShowOCR] = useState(false);

  if (!data) return null;

  const isSuccess = Boolean(data.success);
  const isRcBook = data.documentType === "rc_book";
  const docTypeName = isRcBook ? "RC Book" : "Driving Licence";
  const extractedData = data.data || {};
  const ai = data.aiVerification || {};

  const ocrStatusText = isSuccess ? "Completed" : "Failed";
  const ocrStatusColor = isSuccess ? "#22C55E" : "#EF4444";

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

  const totalFields = fields.length;
  const validFieldsCount = fields.filter((f) => f.value && f.value !== "Not Found").length;

  const aiStatus = ai.status || "Unavailable";
  const aiColors = getStatusColors(aiStatus);
  const aiDecision = getAIDecision(aiStatus);
  const trustScore = ai.overallTrustScore || 0;

  const analysisKeys = [
    { key: "mandatoryFields", label: "Mandatory Fields" },
    { key: "documentValidity", label: "Document Validity" },
    { key: "dateConsistency", label: "Date Consistency" },
    { key: "fieldCompleteness", label: "Field Completeness" },
    { key: "formatValidation", label: "Format Validation" },
  ];

  return (
    <div className="result-card">
      {/* ── Header ── */}
      <div className="result-header">
        <h3>Verification Result</h3>
        <span className="status-badge" style={{ background: isSuccess ? "#22C55E" : "#EF4444" }}>
          {isSuccess ? "✅ Success" : "❌ Failed"}
        </span>
      </div>

      {/* ── Dashboard Summary Strip ── */}
      <div className="dashboard-summary-card">
        <div className="summary-item">
          <span className="summary-label">Document Type</span>
          <span className="summary-value">{docTypeName}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">OCR Status</span>
          <span className="summary-value" style={{ color: ocrStatusColor }}>{ocrStatusText}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Fields Extracted</span>
          <span className="summary-value">{validFieldsCount} / {totalFields}</span>
        </div>
      </div>

      {/* ── Extracted Fields ── */}
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

      {/* ── AI Verification Report ── */}
      <div className="ai-report-section">
        <div className="ai-report-header">
          <div>
            <h4 className="ai-report-title">🤖 AI Verification Report</h4>
            <p className="ai-report-subtitle">Powered by Groq · LLaMA 3.3 70B</p>
          </div>
          <div className="ai-status-badge" style={{ background: aiColors.bg, border: `1px solid ${aiColors.border}`, color: aiColors.text }}>
            {aiStatus}
          </div>
        </div>

        {/* Trust Score + Meta */}
        <div className="ai-trust-row">
          <TrustScoreRing score={trustScore} />
          <div className="ai-meta-grid">
            <div className="ai-meta-item">
              <span className="summary-label">Overall Trust Score</span>
              <span className="summary-value" style={{ color: getScoreColor(trustScore) }}>{trustScore}%</span>
            </div>
            <div className="ai-meta-item">
              <span className="summary-label">Risk Level</span>
              <span className="summary-value">{ai.riskLevel || "Unknown"}</span>
            </div>
            <div className="ai-meta-item">
              <span className="summary-label">Document Quality</span>
              <span className="summary-value">{ai.documentQuality || "Unknown"}</span>
            </div>
          </div>
        </div>

        {/* Verification Summary */}
        {ai.verificationSummary && (
          <div className="ai-summary-box">
            <span className="summary-label">Verification Summary</span>
            <p className="ai-summary-text">{ai.verificationSummary}</p>
          </div>
        )}

        {/* Analysis Checks */}
        {ai.analysis && Object.keys(ai.analysis).length > 0 && (
          <div className="ai-analysis-section">
            <h5 className="ai-subsection-title">Verification Checks</h5>
            {analysisKeys.map(({ key, label }) => (
              ai.analysis[key] ? (
                <AnalysisRow key={key} label={label} checkData={ai.analysis[key]} />
              ) : null
            ))}
          </div>
        )}

        {/* Recommendations */}
        {ai.recommendations && ai.recommendations.length > 0 && (
          <div className="ai-recommendations">
            <h5 className="ai-subsection-title">Recommendations</h5>
            <ul className="recommendations-list">
              {ai.recommendations.map((rec, idx) => (
                <li key={idx} className="recommendation-item">
                  <span className="rec-icon">✔</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Decision Banner */}
        <div className="ai-decision-banner" style={{ background: aiDecision.bg, border: `2px solid ${aiDecision.color}` }}>
          <span className="ai-decision-label">AI DECISION</span>
          <span className="ai-decision-text" style={{ color: aiDecision.color }}>{aiDecision.label}</span>
        </div>
      </div>

      {/* ── Collapsible OCR Text ── */}
      <div className="ocr-collapsible-section">
        <button className="ocr-toggle-btn" onClick={() => setShowOCR(!showOCR)} type="button">
          {showOCR ? "▼ Hide Original OCR Text" : "▶ Show Original OCR Text"}
        </button>
        {showOCR && (
          <div className="ocr-card">
            <span className="label" style={{ display: "block", marginBottom: "0.5rem" }}>Original OCR Text</span>
            <p className="ocr-text-body">{data.ocrText || "Not Found"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationResult;