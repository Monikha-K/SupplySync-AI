import "../styles/Hero.css";

function Hero() {
  return (
    <div className="hero">
      <h1 className="hero-title">
        ETA <span className="highlight">Prediction</span> Agent
      </h1>
      <p className="hero-subtitle">
        AI-powered Real-Time Shipment ETA Prediction for Smart Logistics
      </p>
      <div className="hero-tech-badge">
        <span className="dot" />
        Powered by FastAPI &bull; MongoDB &bull; Groq AI
      </div>
    </div>
  );
}

export default Hero;
