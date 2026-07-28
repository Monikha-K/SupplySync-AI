import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CompletedShipmentsPage from './pages/CompletedShipmentsPage';
import LogisticsReportPage from './pages/LogisticsReportPage';
import './styles/insights.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<CompletedShipmentsPage />} />
        <Route path="/report/:shipmentId" element={<LogisticsReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
