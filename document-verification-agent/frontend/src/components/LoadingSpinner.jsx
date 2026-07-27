import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ message }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
