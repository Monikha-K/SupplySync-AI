import React, { useState, useEffect } from 'react';

const STEPS = [
  { text: 'Analyzing completed shipment...', icon: '🔍' },
  { text: 'Reading simulation history...', icon: '📊' },
  { text: 'Calculating performance...', icon: '⚙️' },
  { text: 'Generating recommendations...', icon: '🤖' },
  { text: 'Preparing logistics report...', icon: '📋' },
];

const LoadingAnimation = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      <div className="loading-orb-wrapper">
        <div className="loading-orb" />
        <div className="loading-ring" />
      </div>

      <div className="loading-messages">
        {STEPS.map((step, idx) => {
          let cls = 'loading-step';
          if (idx < activeIdx) cls += ' done';
          else if (idx === activeIdx) cls += ' active';

          return (
            <div key={idx} className={cls}>
              <span className="loading-step-icon">
                {idx < activeIdx ? '✓' : idx === activeIdx ? (
                  <span className="loading-spinner-sm" />
                ) : step.icon}
              </span>
              <span>{step.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingAnimation;
