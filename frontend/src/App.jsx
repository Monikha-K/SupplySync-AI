import { useState, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import SearchScreen from './components/SearchScreen.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import CreateShipmentModal from './components/CreateShipmentModal.jsx';
import DBStatusModal from './components/DBStatusModal.jsx';

export default function App() {
  const [screen, setScreen] = useState('search');       // 'search' | 'results'
  const [currentShipment, setCurrentShipment] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDBOpen, setIsDBOpen] = useState(false);

  const handleShipmentFound = useCallback((shipment) => {
    setCurrentShipment(shipment);
    setScreen('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackToSearch = useCallback(() => {
    setScreen('search');
    setCurrentShipment(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <Navbar
        onBrandClick={handleBackToSearch}
        onCreateClick={() => setIsCreateOpen(true)}
        onDBClick={() => setIsDBOpen(true)}
      />

      <main className="main-layout container">
        <header className="agent-header">
          <div className="agent-subtitle">
            <span>🤖</span> Autonomous Logistics Intelligence
          </div>
          <h1 className="agent-title">Shipment Monitoring Agent</h1>
        </header>

        {screen === 'search' ? (
          <SearchScreen onShipmentFound={handleShipmentFound} />
        ) : (
          <ResultsScreen
            shipment={currentShipment}
            onShipmentUpdate={setCurrentShipment}
            onBackToSearch={handleBackToSearch}
          />
        )}
      </main>

      <footer>
        <div className="container">
          SupplySync AI Logistics Suite &copy; 2026 &bull; Shipment Monitoring Agent
        </div>
      </footer>

      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleShipmentFound}
      />

      <DBStatusModal
        isOpen={isDBOpen}
        onClose={() => setIsDBOpen(false)}
      />
    </>
  );
}
