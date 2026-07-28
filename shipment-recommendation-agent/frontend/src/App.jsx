import React from 'react';
import './styles/global.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-brand">
            <span className="logo-icon">🚚</span>
            <div>
              <h1>SupplySync AI</h1>
              <span className="nav-sub">Shipment Recommendation Agent</span>
            </div>
            <span className="ai-badge">AI Agent</span>
          </div>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;