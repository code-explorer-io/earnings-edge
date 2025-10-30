import './PolyMarketComparison.css';

function PolyMarketComparison({ word, consistencyScore, polymarketData, onCalculate }) {
  if (!polymarketData || !polymarketData.yesPrice) {
    return null; // Don't show if no PolyMarket data available
  }

  // Calculate fair value based on consistency
  const fairValue = Math.round(consistencyScore);
  const currentPrice = polymarketData.yesPrice;
  const gap = fairValue - currentPrice;
  const impliedYield = ((100 - currentPrice) / currentPrice * 100).toFixed(2);

  // Determine if market is underpriced, overpriced, or fair
  let priceStatus = 'FAIR PRICING';
  let priceColor = '#6b7280';
  let recommendation = 'WAIT';
  let recommendationColor = '#f59e0b';

  if (gap > 5) {
    priceStatus = `${gap}¢ UNDERPRICED`;
    priceColor = '#10b981';
    recommendation = 'BUY ✅';
    recommendationColor = '#10b981';
  } else if (gap < -5) {
    priceStatus = `${Math.abs(gap)}¢ OVERPRICED`;
    priceColor = '#ef4444';
    recommendation = 'AVOID ⚠️';
    recommendationColor = '#ef4444';
  } else if (consistencyScore >= 80) {
    recommendation = 'BUY ✅';
    recommendationColor = '#10b981';
  }

  return (
    <div className="polymarket-comparison">
      <div className="comparison-header">
        <span className="comparison-icon">💰</span>
        <h4>PolyMarket Current Data</h4>
      </div>

      <div className="comparison-content">
        <div className="market-stats">
          <div className="stat-row">
            <span className="stat-label">Current Price:</span>
            <span className="stat-value">
              <span className="price-yes">{currentPrice}¢ YES</span>
              {' / '}
              <span className="price-no">{polymarketData.noPrice}¢ NO</span>
            </span>
          </div>

          {polymarketData.volume && (
            <div className="stat-row">
              <span className="stat-label">Volume:</span>
              <span className="stat-value">${polymarketData.volume.toLocaleString()}</span>
            </div>
          )}

          {polymarketData.traders && (
            <div className="stat-row">
              <span className="stat-label">Traders:</span>
              <span className="stat-value">{polymarketData.traders.toLocaleString()}</span>
            </div>
          )}

          {polymarketData.marketUrl && (
            <div className="stat-row">
              <span className="stat-label">Market:</span>
              <a
                href={polymarketData.marketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="market-link"
              >
                View on PolyMarket →
              </a>
            </div>
          )}
        </div>

        <div className="market-analysis">
          <h5>📈 Market Analysis</h5>

          <div className="analysis-grid">
            <div className="analysis-item">
              <span className="analysis-label">Historical suggests:</span>
              <span className="analysis-value highlight">~{fairValue}¢ fair value</span>
            </div>

            <div className="analysis-item">
              <span className="analysis-label">Current price:</span>
              <span className="analysis-value">{currentPrice}¢</span>
            </div>

            <div className="analysis-item">
              <span className="analysis-label">Gap:</span>
              <span className="analysis-value" style={{ color: priceColor, fontWeight: 700 }}>
                {priceStatus}
              </span>
            </div>

            <div className="analysis-item">
              <span className="analysis-label">Implied Yield:</span>
              <span className="analysis-value">{impliedYield}%</span>
            </div>
          </div>
        </div>

        <div className="recommendation-box" style={{ borderColor: recommendationColor }}>
          <div className="recommendation-header">
            <span className="recommendation-icon">💡</span>
            <span style={{ color: recommendationColor, fontWeight: 700 }}>
              Recommendation: {recommendation}
            </span>
          </div>
          <p className="recommendation-text">
            {gap > 5 && consistencyScore >= 80 && (
              <>Strong historical consistency ({consistencyScore}%) with underpriced market. Low-risk, bond-like yield opportunity.</>
            )}
            {gap > 5 && consistencyScore < 80 && (
              <>Moderate consistency ({consistencyScore}%) but market is underpriced. Consider position sizing carefully.</>
            )}
            {gap < -5 && (
              <>Market is overpriced relative to historical data. Historical consistency is {consistencyScore}%, but current price suggests limited upside.</>
            )}
            {Math.abs(gap) <= 5 && consistencyScore >= 80 && (
              <>Market is fairly priced. Strong historical consistency ({consistencyScore}%) makes this a reliable bet at current pricing.</>
            )}
            {Math.abs(gap) <= 5 && consistencyScore < 80 && (
              <>Market is fairly priced but historical consistency is moderate ({consistencyScore}%). Wait for better odds or more data.</>
            )}
          </p>

          {onCalculate && (
            <button onClick={onCalculate} className="calculate-btn">
              💰 Calculate Profit →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PolyMarketComparison;
