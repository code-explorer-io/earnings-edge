import './EmptyState.css';
import PolyMarketButton from './PolyMarketButton';

function EmptyState({ darkMode }) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-card">
        <div className="empty-state-icon">🚀</div>
        <h3 className="empty-state-title">Ready to Analyze Earnings Calls?</h3>
        <p className="empty-state-description">
          Get started by entering a company ticker and keywords you want to track across quarterly earnings calls.
        </p>

        <div className="empty-state-workflow">
          <p className="workflow-text">
            📊 Analyze earnings → 🔍 Find patterns → 💰 Trade on PolyMarket
          </p>
          <PolyMarketButton
            variant="generic"
            buttonText="Learn About PolyMarket"
            size="medium"
            className="empty-state-polymarket-btn"
          />
        </div>

        <div className="empty-state-example">
          <div className="example-badge">💡 Example Analysis</div>
          <div className="example-content">
            <div className="example-row">
              <span className="example-label">Company:</span>
              <span className="example-value">UBER (Uber Technologies)</span>
            </div>
            <div className="example-row">
              <span className="example-label">Keywords:</span>
              <span className="example-value">Autonomous, Lucid, Waymo, Safety</span>
            </div>
            <div className="example-row">
              <span className="example-label">Result:</span>
              <span className="example-value highlight">Discover which keywords are consistently mentioned quarter over quarter</span>
            </div>
          </div>
        </div>

        <div className="empty-state-features">
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span className="feature-text">Track consistency across 8 quarters</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Get AI-powered insights</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💬</span>
            <span className="feature-text">Read actual transcript context</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
