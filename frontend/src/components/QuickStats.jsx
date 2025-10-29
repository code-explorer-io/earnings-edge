import './QuickStats.css';

function QuickStats({ data, focusedWords, onWordClick }) {
  if (!data || data.length === 0) return null;

  // Filter data if words are focused (multi-select)
  const displayData = focusedWords && focusedWords.length > 0
    ? data.filter(wordData => focusedWords.includes(wordData.word))
    : data;

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

  const getPredictionColor = (prediction) => {
    switch (prediction) {
      case 'highly_likely':
        return '#10b981'; // Green
      case 'likely':
        return '#3b82f6'; // Blue
      case 'possible':
        return '#f59e0b'; // Amber
      default:
        return '#ef4444'; // Red
    }
  };

  const getPredictionLabel = (prediction) => {
    switch (prediction) {
      case 'highly_likely':
        return 'Highly Likely';
      case 'likely':
        return 'Likely';
      case 'possible':
        return 'Possible';
      default:
        return 'Unlikely';
    }
  };

  const getTrafficLightEmoji = (trafficLight) => {
    switch (trafficLight) {
      case 'GREEN':
        return '🟢';
      case 'AMBER':
        return '🟡';
      case 'RED':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getTrafficLightColor = (trafficLight) => {
    switch (trafficLight) {
      case 'GREEN':
        return '#10b981';
      case 'AMBER':
        return '#f59e0b';
      case 'RED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="quick-stats-container">
      <h3>🎯 PolyMarket Prediction Insights</h3>
      <div className="stats-grid">
        {displayData.map((wordData, idx) => (
          <div
            key={idx}
            className="stat-card"
            onClick={() => onWordClick(wordData.word)}
            style={{
              cursor: 'pointer',
              border: focusedWords && focusedWords.includes(wordData.word) ? '3px solid #667eea' : undefined,
              transform: focusedWords && focusedWords.includes(wordData.word) ? 'scale(1.02)' : undefined
            }}
          >
            <div className="stat-header">
              <h4 className="stat-word">{wordData.word}</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span
                  className="traffic-light-badge"
                  style={{
                    fontSize: '2rem',
                    lineHeight: '1'
                  }}
                  title={`${wordData.riskLevel}: ${wordData.consistencyPercent}% consistency`}
                >
                  {getTrafficLightEmoji(wordData.trafficLight)}
                </span>
                <span
                  className="prediction-badge"
                  style={{
                    backgroundColor: getPredictionColor(wordData.prediction),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getPredictionLabel(wordData.prediction)}
                </span>
              </div>
            </div>

            {/* Traffic Light Summary */}
            <div className="consistency-summary" style={{
              backgroundColor: getTrafficLightColor(wordData.trafficLight) + '15',
              border: `2px solid ${getTrafficLightColor(wordData.trafficLight)}`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: getTrafficLightColor(wordData.trafficLight) }}>
                {wordData.riskLevel}
              </div>
              <div style={{ fontSize: '1.05rem', marginTop: '4px' }}>
                Mentioned in <strong>{wordData.quartersMentioned} out of {wordData.totalQuarters}</strong> quarters
              </div>
              <div style={{ fontSize: '1.05rem', color: '#6b7280', marginTop: '2px', fontWeight: '600' }}>
                ({wordData.consistencyPercent}% consistency)
              </div>
              <div style={{
                fontSize: '1.05rem',
                fontWeight: 'bold',
                marginTop: '6px',
                color: getTrafficLightColor(wordData.trafficLight)
              }}>
                Bond Rating: {wordData.bondRating}
              </div>
            </div>

            {/* Trading Recommendation */}
            <div className="recommendation-box" style={{
              backgroundColor:
                wordData.recommendation === 'BUY' ? '#10b98115' :
                wordData.recommendation === 'AVOID' ? '#ef444415' :
                '#f59e0b15',
              border: `2px solid ${
                wordData.recommendation === 'BUY' ? '#10b981' :
                wordData.recommendation === 'AVOID' ? '#ef4444' :
                '#f59e0b'
              }`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: wordData.recommendation === 'BUY' ? '#10b981' :
                       wordData.recommendation === 'AVOID' ? '#ef4444' :
                       '#f59e0b'
              }}>
                💡 {wordData.recommendation}
              </div>
              <div style={{ fontSize: '1rem', color: '#6b7280', marginTop: '6px', fontStyle: 'italic' }}>
                {wordData.recommendationReason}
              </div>
            </div>

            <div className="stat-details">
              <div className="stat-item">
                <span className="stat-label">📊 Last 4 Q Avg:</span>
                <span className="stat-value" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {wordData.last4Avg} mentions
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">📈 Recent Rate (L4Q):</span>
                <span className="stat-value">{wordData.mentionRate}% of quarters</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickStats;
