import React, { useState } from 'react';
import UploadForm from '../components/UploadForm';
import VerificationResult from '../components/VerificationResult';
import LoadingSpinner from '../components/LoadingSpinner';
import { verifyDocument } from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await verifyDocument(file);
      if (response && response.success === false) {
        setError(response.message || "OCR Failed");
        setResult(response);
      } else {
        setResult(response);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'OCR Failed';
      setError(errorMessage);
      setResult({
        success: false,
        documentType: "Not Found",
        driverName: "Not Found",
        licenseNumber: "Not Found",
        issueDate: "Not Found",
        expiryDate: "Not Found",
        vehicleClass: "Not Found",
        issuingAuthority: "Not Found",
        ocrText: "Not Found",
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <h2>AI Document Verification</h2>
        <p>Upload logistics documents and verify them using OCR and rule-based extraction.</p>
      </section>
      
      <section className="upload-section">
        {!loading && !result && <UploadForm onUpload={handleUpload} />}
        {loading && <LoadingSpinner message="Extracting fields from document..." />}
        {error && <div className="error-message">{error}</div>}
        {result && !loading && (
          <div className="result-container">
            <VerificationResult data={result} />
            <button className="reset-btn" onClick={() => { setResult(null); setError(null); }}>
              Verify Another Document
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
