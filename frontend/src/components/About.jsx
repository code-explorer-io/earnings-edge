import './About.css';

function About({ onTabChange }) {
  return (
    <div className="about-container">
      <div className="about-header">
        <h2>About EarningsEdge</h2>
        <p className="about-subtitle">
          Historical earnings call data analysis for informed trading decisions
        </p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <div className="section-icon">🎯</div>
          <h3>What is EarningsEdge?</h3>
          <p>
            EarningsEdge is a historical data analysis tool for earnings call transcripts. We track
            keyword mention patterns across the last 8 quarters of earnings calls, providing factual
            frequency data that traders can use to inform their own PolyMarket predictions.
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
                <h4>Review Historical Patterns</h4>
                <p>Use consistency scores and frequency data to inform your trading decisions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section transparency-section">
          <div className="section-icon">💎</div>
          <h3>Why is EarningsEdge Free?</h3>
          <div className="transparency-box">
            <p>
              <strong>EarningsEdge is completely free with unlimited analyses.</strong> No credits, no paywalls, no subscriptions.
            </p>
            <p>
              We earn small commissions when you trade on PolyMarket using our analysis. This affiliate model
              keeps the tool free while helping us cover API costs and server expenses.
            </p>
            <p>
              Your support through these links means we can keep building features and helping more traders
              make data-driven decisions. We're transparent about this relationship because we believe in
              building trust with our users.
            </p>
            <p className="thank-you">
              Thank you for using EarningsEdge! 🙏
            </p>
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
              <p>GREEN, AMBER, or RED indicators based on consistency scores</p>
            </div>
            <div className="feature">
              <h4>💬 AI-Powered Context</h4>
              <p>Get AI summaries and read actual transcript excerpts for each keyword</p>
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
              <h4>Traffic Light Indicators</h4>
              <p>Visual indicators showing historical mention consistency:</p>
              <ul>
                <li><span className="badge green">GREEN</span> ≥80% - Mentioned in 80%+ of quarters</li>
                <li><span className="badge amber">AMBER</span> 50-79% - Mentioned in 50-79% of quarters</li>
                <li><span className="badge red">RED</span> &lt;50% - Mentioned in less than 50% of quarters</li>
              </ul>
              <div className="metric-example">
                <strong>Note:</strong> These are historical patterns only. Past frequency does not predict future mentions.
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="section-icon">⚠️</div>
          <h3>Important Disclaimers</h3>
          <div className="disclaimer-box">
            <p>
              <strong>This is a historical data analysis tool only.</strong> EarningsEdge displays
              factual frequency data from past earnings transcripts. We do not make predictions or
              recommendations about future earnings calls.
            </p>
            <p>
              <strong>Not Financial Advice:</strong> Historical mention patterns do not guarantee or
              predict future mentions. Past data is not indicative of future results. Always conduct
              your own research and analysis before making any trading decisions.
            </p>
            <p>
              <strong>Your Responsibility:</strong> You are solely responsible for interpreting this
              historical data and making your own trading decisions. Trade at your own risk and never
              invest more than you can afford to lose.
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
