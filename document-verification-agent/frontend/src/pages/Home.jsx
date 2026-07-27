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
      // Simulate API call
      const response = await verifyDocument(file);
      setResult(response);
    } catch (err) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <h2>AI Document Verification</h2>
        <p>Upload logistics documents and verify them using OCR and AI.</p>
      </section>
      
      <section className="upload-section">
        {!loading && !result && <UploadForm onUpload={handleUpload} />}
        {loading && <LoadingSpinner message="Verifying document..." />}
        {error && <div className="error-message">{error}</div>}
        {result && (
          <div className="result-container">
            <VerificationResult data={result} />
            <button className="reset-btn" onClick={() => setResult(null)}>
              Verify Another Document
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
