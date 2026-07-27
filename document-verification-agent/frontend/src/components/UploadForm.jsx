import React, { useState, useRef } from 'react';
import '../styles/UploadForm.css';

const UploadForm = ({ onUpload, docType, onDocTypeChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const inputRef = useRef(null);

  const isRcBook = docType === 'rc_book';
  const acceptedFormats = isRcBook ? '.pdf' : '.pdf,.jpg,.jpeg,.png';

  const handleDocTypeSelect = (e) => {
    const newDocType = e.target.value;
    onDocTypeChange(newDocType);
    setSelectedFile(null);
    setFileError(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setFileError(null);
    const fileName = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf');
    const isImg = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type) || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');

    if (isRcBook) {
      if (isPdf) {
        setSelectedFile(file);
      } else {
        setFileError('For RC Book only PDF files are supported.');
        setSelectedFile(null);
      }
    } else {
      if (isPdf || isImg) {
        setSelectedFile(file);
      } else {
        setFileError('Supported formats: PDF, JPG, JPEG, PNG.');
        setSelectedFile(null);
      }
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleUploadSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile, docType);
    }
  };

  return (
    <div className="upload-card">
      <div className="doc-type-selector" style={{ marginBottom: '1.5rem', width: '100%' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Document Type</label>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="documentType"
              value="driving_license"
              checked={docType === 'driving_license'}
              onChange={handleDocTypeSelect}
            />
            Driving Licence
          </label>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="documentType"
              value="rc_book"
              checked={docType === 'rc_book'}
              onChange={handleDocTypeSelect}
            />
            RC Book
          </label>
        </div>
      </div>

      <div
        className={dragActive ? "drag-area active" : "drag-area"}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="file-input"
          accept={acceptedFormats}
          onChange={handleChange}
        />
        <div className="upload-icon">📄</div>
        <p className="drag-text">Choose File</p>
        <p className="support-text">
          {isRcBook 
            ? "Supported Formats: PDF Only"
            : "Supported Formats: PDF, JPG, JPEG, PNG"}
        </p>
        <button className="choose-btn" type="button">Choose File</button>
      </div>

      {fileError && (
        <div className="error-message" style={{ marginTop: '1rem' }}>
          {fileError}
        </div>
      )}

      {selectedFile && (
        <div className="file-preview">
          <span className="file-name">{selectedFile.name}</span>
          <button className="upload-btn" onClick={handleUploadSubmit}>
            Verify Document
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
