import React from 'react';

const PerformanceCard = ({ report }) => {
  const score = report.performanceScore;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let colorClass = 'green';
  if (score < 70) colorClass = 'red';
  else if (score < 90) colorClass = 'yellow';

  let scoreLabel = 'Excellent';
  if (score < 70) scoreLabel = 'Needs Improvement';
  else if (score < 90) scoreLabel = 'Good';

  return (
    <div className="report-section">
      <div className="section-title">
        <span className="section-icon">📈</span>
        Performance Analysis
      </div>
      <div className="performance-grid">
        <div className="performance-stats">
          <div className="perf-stat">
            <span className="perf-stat-label">Planned ETA</span>
            <span className="perf-stat-value">{report.plannedETA} hrs</span>
          </div>
          <div className="perf-stat">
            <span className="perf-stat-label">Actual Travel Time</span>
            <span className="perf-stat-value">{report.actualTravelTime} hrs</span>
          </div>
          <div className="perf-stat">
            <span className="perf-stat-label">Delay</span>
            <span className="perf-stat-value">{report.delayMinutes} min</span>
          </div>
          <div className="perf-stat">
            <span className="perf-stat-label">Delivery Status</span>
            <span className="perf-stat-value" style={{ color: 'var(--success)' }}>
              ✅ {report.deliveryStatus}
            </span>
          </div>
        </div>

        <div className="score-circle-wrapper">
          <div className="score-circle">
            <svg viewBox="0 0 140 140">
              <circle className="score-track" cx="70" cy="70" r={radius} />
              <circle
                className={`score-fill ${colorClass}`}
                cx="70"
                cy="70"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="score-text">
              <div className={`score-value ${colorClass}`}>{score}</div>
              <div className="score-label">Score</div>
            </div>
          </div>
          <span className={`score-tag ${colorClass}`}>{scoreLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCard;
