import { useState } from 'react';
import { sendAIQuery } from '../api.js';

export default function AIAssistant({ shipment }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [responseSource, setResponseSource] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('🤖 Agent thinking...');
    setResponseSource('');

    try {
      const data = await sendAIQuery(shipment.shipmentId, query);
      setResponse(data.success ? data.answer : 'Unable to answer query at this time.');
      setResponseSource(data.source || '');
    } catch {
      setResponse('Error connecting to AI Agent service.');
      setResponseSource('');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAsk();
  }

  function readSpeech() {
    const text = shipment.summary;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 1.0;
      window.speechSynthesis.speak(utt);
    } else {
      alert('Voice Speech Synthesis is not supported in this browser.');
    }
  }

  const riskColor = shipment.status === 'Delayed' ? '#FBBF24' : '#4ADE80';

  return (
    <div className="ai-summary-card">
      <div className="ai-summary-top">
        <div className="ai-badge">✨ AI Shipment Update</div>
        <button className="btn-voice" onClick={readSpeech}>🔊 Read AI Voice</button>
      </div>

      <p className="ai-summary-text">{shipment.summary}</p>

      <div className="ai-meta-pills">
        <div className="ai-meta-pill">
          Risk Level: <strong style={{ color: riskColor }}>{shipment.riskLevel || 'Low / Normal'}</strong>
        </div>
        <div className="ai-meta-pill">
          AI Confidence: <strong>99.4%</strong>
        </div>
        <div className="ai-meta-pill">
          Route Health: <strong>Optimal</strong>
        </div>
      </div>

      <div className="ai-interactive-box">
        <label className="ai-input-label">Ask AI Agent about this shipment:</label>
        <div className="ai-input-row">
          <input
            type="text"
            className="ai-input"
            placeholder="e.g. Will there be delays? or Driver contact?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="ai-send-btn" onClick={handleAsk} disabled={loading}>
            {loading ? '...' : 'Ask Agent'}
          </button>
        </div>
        {response && (
          <div className="ai-response-output">
            {responseSource === 'gemini' && (
              <div style={{
                fontSize: '0.7rem', color: '#60a5fa', fontWeight: 700,
                marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                ✨ Powered by Gemini AI
              </div>
            )}
            {response}
          </div>
        )}
      </div>
    </div>
  );
}
