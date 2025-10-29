import './QuickStats.css';

function QuickStats({ data }) {
  if (!data || data.length === 0) return null;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return '📈';
      case 'decreasing':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing':
        return '#10b981';
      case 'decreasing':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="quick-stats-container">
      <h3>⚡ Quick Stats</h3>
      <div className="stats-grid">
        {data.map((wordData, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-header">
              <h4 className="stat-word">{wordData.word}</h4>
              <span
                className="stat-trend-icon"
                style={{ color: getTrendColor(wordData.trend) }}
              >
                {getTrendIcon(wordData.trend)}
              </span>
            </div>
            <div className="stat-details">
              <div className="stat-item">
                <span className="stat-label">Total Mentions:</span>
                <span className="stat-value">{wordData.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average/Quarter:</span>
                <span className="stat-value">{wordData.average}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Highest:</span>
                <span className="stat-value">
                  {wordData.highest.count} ({wordData.highest.quarter})
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Lowest:</span>
                <span className="stat-value">
                  {wordData.lowest.count} ({wordData.lowest.quarter})
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Trend:</span>
                <span
                  className="stat-value"
                  style={{ color: getTrendColor(wordData.trend) }}
                >
                  {wordData.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickStats;
