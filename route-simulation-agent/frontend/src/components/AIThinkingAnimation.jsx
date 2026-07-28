import React, { useEffect, useState } from 'react';

const AIThinkingAnimation = ({ onComplete }) => {
  const steps = [
    'Reading Shipment Details...',
    'Loading Route Geography...',
    'Generating Simulation Checkpoints...',
    'Preparing Simulation Environment...',
    'Simulation Ready!'
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let timeout;
    if (currentStep < steps.length - 1) {
      timeout = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 900);
    } else {
      timeout = setTimeout(() => {
        onComplete();
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [currentStep, onComplete, steps.length]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="loader-card" style={{ minWidth: '350px' }}>
        <div className="loader-icon">🤖</div>
        <div className="loader-title">AI Route Simulator</div>
        
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '0.75rem',
                opacity: idx <= currentStep ? 1 : 0.3,
                transition: 'opacity 0.3s ease',
                color: idx === currentStep ? 'var(--secondary)' : (idx < currentStep ? 'var(--success)' : 'var(--muted)'),
                fontWeight: idx === currentStep ? 600 : 400
              }}
            >
              <span>{idx < currentStep ? '✅' : (idx === currentStep ? '🔄' : '⏳')}</span>
              <span style={{ fontSize: '0.85rem' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIThinkingAnimation;
