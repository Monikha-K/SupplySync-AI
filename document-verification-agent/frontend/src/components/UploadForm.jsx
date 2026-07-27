import React, { useState, useRef } from 'react';
import '../styles/UploadForm.css';

const UploadForm = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

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
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (validTypes.includes(file.type)) {
      setSelectedFile(file);
    } else {
      alert("Unsupported file type. Please upload PDF, PNG or JPG.");
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleUploadSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="upload-card">
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
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
        />
        <div className="upload-icon">📤</div>
        <p className="drag-text">Drag and Drop Area</p>
        <p className="support-text">Supported: PDF, PNG, JPG</p>
        <button className="choose-btn" type="button">Choose File</button>
      </div>

      {selectedFile && (
        <div className="file-preview">
          <span className="file-name">{selectedFile.name}</span>
          <button className="upload-btn" onClick={handleUploadSubmit}>
            Upload Button
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
