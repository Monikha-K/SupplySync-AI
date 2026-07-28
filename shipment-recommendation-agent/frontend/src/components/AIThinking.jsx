import React, { useState, useEffect } from 'react';

const STEPS = [
  '🤖 AI Agent analyzing routes...',
  '📍 Finding best organization...',
  '⭐ Comparing ratings...',
  '⏱️ Evaluating ETA...',
  '✅ Selecting optimal shipment...',
];

const AIThinking = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length - 1) return;
    const t = setTimeout(() => setStep(s => s + 1), 700);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="ai-thinking-card">
      <span className="ai-thinking-icon">🤖</span>
      <div className="ai-thinking-title">AI Agent Processing</div>
      <div className="ai-thinking-message" key={step}>
        {STEPS[step]}
      </div>
      <div className="ai-dot-loader">
        <div className="ai-dot" />
        <div className="ai-dot" />
        <div className="ai-dot" />
      </div>
    </div>
  );
};

export default AIThinking;
