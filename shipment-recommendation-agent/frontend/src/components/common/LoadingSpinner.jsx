import React from 'react';
import '../../styles/LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Finding the best shipments for you...' }) => {
  return (
    <div className="spinner-wrapper">
      <div className="spinner"></div>
      <p className="spinner-text">{message}</p>
    </div>
  );
};

export default LoadingSpinner;