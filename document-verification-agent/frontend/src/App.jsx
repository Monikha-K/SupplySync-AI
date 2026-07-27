import React from 'react';
import Home from './pages/Home';
import './styles/global.css';

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">📄</span>
          <h1>Document Verification Agent</h1>
        </div>
      </nav>
      <main>
        <Home />
      </main>
    </div>
  );
}

export default App;
