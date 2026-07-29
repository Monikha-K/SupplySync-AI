import "../styles/Cards.css";

function AISummaryCard({ summary }) {
  return (
    <div className="glass-card">
      <div className="card-header">
        <span className="card-icon">🤖</span>
        <h2>AI Summary</h2>
      </div>
      <p className="ai-summary-text">{summary}</p>
    </div>
  );
}

export default AISummaryCard;
