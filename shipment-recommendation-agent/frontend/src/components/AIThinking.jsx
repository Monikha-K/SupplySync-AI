import React, { useState, useEffect } from 'react';

const steps = [
  "Reading shipment database...",
  "Validating shipment records...",
  "Filtering eligible shipments...",
  "Calculating recommendation scores...",
  "Comparing alternatives...",
  "Selecting best shipment...",
  "Generating explanation...",
  "Recommendation completed."
];

const AIThinking = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 600); // Wait 600ms per step
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="ai-thinking-card">
      <div className="ai-thinking-icon">🤖</div>
      <h3 className="ai-thinking-title">Explainable AI Agent</h3>
      
      <div className="ai-steps-container" style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '400px', margin: '2rem auto 0' }}>
        {steps.map((step, index) => (
          <div 
            key={index} 
            style={{ 
              opacity: index <= currentStep ? 1 : 0.3,
              color: index === currentStep ? 'var(--primary-color)' : 'var(--body-text)',
              fontWeight: index === currentStep ? 'bold' : 'normal',
              marginBottom: '0.5rem',
              transition: 'opacity 0.3s'
            }}
          >
            {index < currentStep ? '✓ ' : (index === currentStep ? '➤ ' : '○ ')}
            {step}
          </div>
        ))}
      </div>

      <div className="ai-dot-loader" style={{ marginTop: '2rem' }}>
        <div className="ai-dot"></div>
        <div className="ai-dot"></div>
        <div className="ai-dot"></div>
      </div>
    </div>
  );
};

export default AIThinking;
