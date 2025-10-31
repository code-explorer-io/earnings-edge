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
        return (
          <>
            <div className="modal-icon modal-icon-error">⚠️</div>
            <h2 className="modal-title">Out of Credits</h2>
            <p className="modal-message">
              You've used all your credits for today. Your daily credits will refresh at midnight UTC.
            </p>
            {timeUntilRefresh && (
              <div className="refresh-timer">
                <div className="timer-label">Next refresh in:</div>
                <div className="timer-value">
                  {timeUntilRefresh.hours}h {timeUntilRefresh.minutes}m
                </div>
              </div>
            )}
            <div className="modal-info" style={{
              background: darkMode ? '#2a2a2a' : '#f9fafb',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                💡 What you get daily:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>5 free credits every day</li>
                <li>Reset at midnight UTC</li>
                <li>Each analysis costs 1 credit</li>
              </ul>
            </div>
            <div className="modal-future-feature" style={{
              background: darkMode ? '#1e3a2a' : '#f0fdf4',
              color: darkMode ? '#86efac' : '#16a34a',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem',
              border: darkMode ? '1px solid #2a4a3a' : '1px solid #bbf7d0'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                🚀 Coming Soon: Purchase Credits
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                Buy credit bundles that never expire. Powered by Coinbase Commerce for secure crypto payments.
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
          {warningType === 'welcome' ? 'Get Started' : 'Close'}
        </button>
      </div>
    </div>
  );
}

export default CreditWarningModal;
