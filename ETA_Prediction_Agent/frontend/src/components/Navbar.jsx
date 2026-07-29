import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="truck">🚚</span>
        <span className="brand-white">SupplySync</span>
        <span className="brand-cyan">AI</span>
      </div>
      <div className="navbar-badge">
        <span className="sparkle">✨</span>
        ETA Prediction Agent
      </div>
    </nav>
  );
}

export default Navbar;
