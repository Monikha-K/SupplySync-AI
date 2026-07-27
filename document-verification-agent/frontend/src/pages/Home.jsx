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
  const [docType, setDocType] = useState('driving_license');

  const handleUpload = async (file, selectedDocType) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await verifyDocument(file, selectedDocType);
      if (response && response.success === false) {
        setError(response.message || "OCR Processing Failed");
        setResult(response);
      } else {
        setResult(response);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'OCR Processing Failed';
      setError(errorMessage);
      setResult({
        success: false,
        documentType: selectedDocType,
        data: {},
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
        <h2>Document Verification</h2>
        <p>Select document type and upload for verification.</p>
      </section>
      
      <section className="upload-section">
        {!loading && !result && (
          <UploadForm 
            onUpload={handleUpload} 
            docType={docType}
            onDocTypeChange={setDocType}
          />
        )}
        {loading && <LoadingSpinner message="Extracting document fields..." />}
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
