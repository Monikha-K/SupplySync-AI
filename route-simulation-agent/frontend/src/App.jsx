import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RouteSimulationPage from './pages/RouteSimulationPage';
import './styles/routeSimulation.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RouteSimulationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
