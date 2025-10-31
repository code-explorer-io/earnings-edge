import { useEffect, useState } from 'react';
import { getTimeUntilRefresh, getCreditStatus } from '../utils/creditManager';
import './CreditWarningModal.css';

function CreditWarningModal({ isOpen, onClose, warningType, darkMode }) {
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(null);

  useEffect(() => {
    if (isOpen) {
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const updateTime = () => {
    const status = getCreditStatus();
    setTimeUntilRefresh(status.timeUntilRefresh);
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (warningType) {
      case 'no-credits':
        const status = getCreditStatus();
        const welcomeUsed = status?.welcomeUsed;

        return (
          <>
            <div className="modal-icon modal-icon-error">⏰</div>
            <h2 className="modal-title">Out of Credits!</h2>
            <p className="modal-message">
              {welcomeUsed
                ? "You've used your 5 free credits today. Get 5 more free credits tomorrow at midnight UTC!"
                : "You've used your 10 welcome credits!"}
            </p>

            {timeUntilRefresh && welcomeUsed && (
              <div className="refresh-timer">
                <div className="timer-label">Next refresh in:</div>
                <div className="timer-value">
                  {timeUntilRefresh.hours}h {timeUntilRefresh.minutes}m
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                  Credits refresh at midnight UTC
                </div>
              </div>
            )}

            {!welcomeUsed && (
              <div className="modal-info" style={{
                background: darkMode ? '#2a2a2a' : '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#10b981' }}>
                  🌅 Starting tomorrow, you'll get:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>5 free credits every day</li>
                  <li>Automatically at midnight UTC</li>
                  <li>Perfect for daily trading insights</li>
                </ul>
              </div>
            )}

            <div className="modal-future-feature" style={{
              background: darkMode ? '#1e3a2a' : '#f0fdf4',
              color: darkMode ? '#86efac' : '#16a34a',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem',
              border: darkMode ? '1px solid #2a4a3a' : '1px solid #bbf7d0'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '1.05rem' }}>
                💎 Want Unlimited Credits Now?
              </div>
              <div style={{ fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.6' }}>
                Soon you'll be able to buy credit bundles that never expire. Pay with cryptocurrency via Coinbase Commerce - instant delivery!
              </div>
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>Coming Soon - Buy Credits</span>
              </button>
              <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem', textAlign: 'center' }}>
                Coinbase checkout launching soon • Pay with USDC, BTC, or ETH
              </div>
            </div>
          </>
        );

      case 'low-credits':
        return (
          <>
            <div className="modal-icon modal-icon-warning">🔸</div>
            <h2 className="modal-title">Low on Credits</h2>
            <p className="modal-message">
              You only have a few credits remaining. Make them count!
            </p>
            <div className="modal-info" style={{
              background: darkMode ? '#2a2a2a' : '#f9fafb',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                💡 Tips for maximizing your credits:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>Focus on high-value PolyMarket opportunities</li>
                <li>Analyze multiple words at once</li>
                <li>Daily credits refresh at midnight UTC</li>
              </ul>
            </div>
            {timeUntilRefresh && (
              <div className="refresh-timer" style={{ marginTop: '1rem' }}>
                <div className="timer-label">Next refresh in:</div>
                <div className="timer-value">
                  {timeUntilRefresh.hours}h {timeUntilRefresh.minutes}m
                </div>
              </div>
            )}
          </>
        );

      case 'welcome':
        return (
          <>
            <div className="modal-icon modal-icon-success">🎉</div>
            <h2 className="modal-title">Welcome to EarningsEdge!</h2>
            <p className="modal-message">
              You've been granted 10 welcome credits to get started. Each analysis costs 1 credit.
            </p>
            <div className="modal-info" style={{
              background: darkMode ? '#2a2a2a' : '#f9fafb',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                🎯 How it works:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>Start with 10 welcome credits</li>
                <li>Each transcript analysis costs 1 credit</li>
                <li>After using your welcome credits, get 5 free credits daily</li>
                <li>Daily credits refresh at midnight UTC</li>
                <li>Future: Purchase credits that never expire</li>
              </ul>
            </div>
            <div className="modal-tip" style={{
              background: darkMode ? '#1e3a2a' : '#f0fdf4',
              color: darkMode ? '#86efac' : '#16a34a',
              padding: '0.75rem',
              borderRadius: '6px',
              marginTop: '1rem',
              fontSize: '0.9rem',
              border: darkMode ? '1px solid #2a4a3a' : '1px solid #bbf7d0'
            }}>
              <strong>Pro Tip:</strong> Analyze multiple words at once to maximize your credit value!
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: darkMode ? '#1e1e1e' : 'white',
          color: darkMode ? '#E0E0E0' : '#374151'
        }}
      >
        {renderContent()}
        <button
          className="modal-button"
          onClick={onClose}
          style={{
            background: darkMode ? '#444' : '#f3f4f6',
            color: darkMode ? '#E0E0E0' : '#374151'
          }}
        >
          {warningType === 'welcome' ? 'Get Started' : warningType === 'no-credits' ? 'Come Back Tomorrow' : 'Close'}
        </button>
      </div>
    </div>
  );
}

export default CreditWarningModal;
