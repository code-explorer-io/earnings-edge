import './About.css';

function About({ onTabChange }) {
  return (
    <div className="about-container">
      <div className="about-header">
        <h2>About EarningsEdge</h2>
        <p className="about-subtitle">
          Your competitive advantage for PolyMarket prediction markets
        </p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <div className="section-icon">🎯</div>
          <h3>What is EarningsEdge?</h3>
          <p>
            EarningsEdge is a powerful analytics tool designed to help PolyMarket traders make data-driven
            decisions on earnings call prediction markets. By analyzing historical earnings transcripts,
            we provide insights into whether specific words or phrases are likely to be mentioned in
            upcoming earnings calls.
          </p>
        </div>

        <div className="about-section">
          <div className="section-icon">📊</div>
          <h3>How It Works</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Select a Company</h4>
                <p>Choose from the top 100 US companies or enter any ticker symbol</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Enter Keywords</h4>
                <p>Add words or phrases you want to track in earnings transcripts</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Analyze Data</h4>
                <p>Get insights from the last 8 quarters of earnings call transcripts</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Make Informed Decisions</h4>
                <p>Use our consistency scores, trends, and recommendations to trade with confidence</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="section-icon">🔍</div>
          <h3>Key Features</h3>
          <div className="features-grid">
            <div className="feature">
              <h4>📈 Frequency Analysis</h4>
              <p>Track how often specific words appear across multiple quarters</p>
            </div>
            <div className="feature">
              <h4>🚦 Traffic Light System</h4>
              <p>GREEN, AMBER, or RED ratings based on consistency scores</p>
            </div>
            <div className="feature">
              <h4>💎 Bond Ratings</h4>
              <p>AAA to B ratings indicating reliability of mention patterns</p>
            </div>
            <div className="feature">
              <h4>💰 Profit Calculator</h4>
              <p>Calculate potential returns and compare different positions</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="section-icon">📖</div>
          <h3>Understanding the Metrics</h3>
          <div className="metrics-explanation">
            <div className="metric-card">
              <h4>Consistency Score</h4>
              <p>
                The percentage of quarters (out of the last 8) where the word was mentioned at least
                once. Higher scores indicate more reliable patterns.
              </p>
              <div className="metric-example">
                <strong>Example:</strong> 7 out of 8 quarters = 87.5% consistency
              </div>
            </div>

            <div className="metric-card">
              <h4>Traffic Light Rating</h4>
              <ul>
                <li><span className="badge green">GREEN</span> ≥80% consistency - Low Risk</li>
                <li><span className="badge amber">AMBER</span> 50-79% consistency - Medium Risk</li>
                <li><span className="badge red">RED</span> &lt;50% consistency - High Risk</li>
              </ul>
            </div>

            <div className="metric-card">
              <h4>Bond Rating System</h4>
              <p>Similar to credit ratings, indicating reliability:</p>
              <ul>
                <li><strong>AAA:</strong> ≥87.5% - Exceptional consistency</li>
                <li><strong>AA:</strong> 75-87.4% - Very reliable</li>
                <li><strong>A:</strong> 62.5-74.9% - Reliable</li>
                <li><strong>BBB:</strong> 50-62.4% - Moderate</li>
                <li><strong>BB-B:</strong> &lt;50% - Speculative</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="section-icon">⚠️</div>
          <h3>Important Disclaimers</h3>
          <div className="disclaimer-box">
            <p>
              <strong>This tool is for informational purposes only.</strong> Historical data does not
              guarantee future results. Past earnings call mentions are not predictive of future
              mentions. Always conduct your own research and consider multiple factors before making
              trading decisions.
            </p>
            <p>
              EarningsEdge analyzes historical transcripts and provides statistical insights. It does
              not constitute financial advice. Trade at your own risk and never invest more than you
              can afford to lose.
            </p>
          </div>
        </div>

        <div className="about-section cta-section">
          <h3>Ready to Start?</h3>
          <p>
            Head over to the{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onTabChange('analyze'); }} className="tab-link">
              Analyze
            </a>{' '}
            tab to start researching earnings call mentions, or use the{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onTabChange('calculator'); }} className="tab-link">
              Calculator
            </a>{' '}
            tab to plan your positions.
          </p>
        </div>
      </div>

      <div className="about-footer">
        <p>
          Built with data from API Ninjas • Analyze the last 8 quarters of earnings transcripts
        </p>
        <p className="disclaimer-footer">
          Not financial advice • Data for informational purposes only
        </p>
      </div>
    </div>
  );
}

export default About;
