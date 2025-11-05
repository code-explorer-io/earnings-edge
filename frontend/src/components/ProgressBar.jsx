import { useEffect, useState } from 'react';
import './ProgressBar.css';

function ProgressBar({ status, progress }) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // Smooth progress animation
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getStatusMessage = () => {
    if (progress < 30) return 'Fetching transcripts...';
    if (progress < 60) return 'Analyzing keyword patterns...';
    if (progress < 90) return 'Calculating consistency scores...';
    return 'Finalizing results...';
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${displayProgress}%` }}
          >
            <div className="progress-bar-shimmer"></div>
          </div>
        </div>
        <p className="progress-status-text">
          {status || getStatusMessage()}
        </p>
        <p className="progress-percentage">{Math.round(displayProgress)}%</p>
      </div>
    </div>
  );
}

export default ProgressBar;
