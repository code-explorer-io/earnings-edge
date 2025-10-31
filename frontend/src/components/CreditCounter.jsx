import { useState, useEffect } from 'react';
import { getCurrentCredits, getCreditStatus, getTimeUntilRefresh } from '../utils/creditManager';
import './CreditCounter.css';

function CreditCounter({ onCreditUpdate, darkMode }) {
  const [credits, setCredits] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [creditStatus, setCreditStatus] = useState(null);

  useEffect(() => {
    updateCredits();

    // Update credits every second to show real-time countdown
    const interval = setInterval(updateCredits, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateCredits = () => {
    const currentCredits = getCurrentCredits();
    const status = getCreditStatus();

    setCredits(currentCredits);
    setCreditStatus(status);

    if (onCreditUpdate) {
      onCreditUpdate(currentCredits, status);
    }
  };

  const getCreditColor = () => {
    if (credits === 0) return '#ef4444'; // Red
    if (credits <= 2) return '#f59e0b'; // Orange
    if (credits <= 5) return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  const getCreditIcon = () => {
    if (credits === 0) return '⚠️';
    if (credits <= 2) return '🔸';
    return '⚡';
  };

  const formatTimeUntilRefresh = () => {
    if (!creditStatus || !creditStatus.welcomeUsed) {
      return 'Welcome credits active';
    }

    const { hours, minutes } = creditStatus.timeUntilRefresh;
    return `Refreshes in ${hours}h ${minutes}m`;
  };

  return (
    <div
      className="credit-counter-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="credit-counter" style={{ borderColor: getCreditColor() }}>
        <span className="credit-icon">{getCreditIcon()}</span>
        <span className="credit-number" style={{ color: getCreditColor() }}>
          {credits}
        </span>
        <span className="credit-label">
          {credits === 1 ? 'credit' : 'credits'}
        </span>
      </div>

      {showTooltip && creditStatus && (
        <div className="credit-tooltip" style={{
          background: darkMode ? '#1e1e1e' : 'white',
          color: darkMode ? '#E0E0E0' : '#374151',
          border: darkMode ? '1px solid #444' : '1px solid #e5e7eb'
        }}>
          <div className="tooltip-header">
            <strong>Credit Balance</strong>
          </div>

          {/* Progress Bar for Daily Credits */}
          {creditStatus.welcomeUsed && creditStatus.freeCredits < 3 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                marginBottom: '0.25rem',
                opacity: 0.8
              }}>
                <span>Today's Free Credits</span>
                <span>{creditStatus.freeCredits}/3</span>
              </div>
              <div style={{
                height: '8px',
                background: darkMode ? '#2a2a2a' : '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(creditStatus.freeCredits / 3) * 100}%`,
                  background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                  transition: 'width 0.3s ease',
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>
          )}

          <div className="tooltip-row">
            <span>Total Credits:</span>
            <span className="tooltip-value">{creditStatus.totalCredits}</span>
          </div>

          {creditStatus.purchasedCredits > 0 && (
            <>
              <div className="tooltip-row">
                <span>Free Credits:</span>
                <span className="tooltip-value">{creditStatus.freeCredits}</span>
              </div>
              <div className="tooltip-row">
                <span>Purchased:</span>
                <span className="tooltip-value" style={{ color: '#10b981' }}>
                  {creditStatus.purchasedCredits} (never expire)
                </span>
              </div>
            </>
          )}

          <div className="tooltip-divider"></div>

          <div className="tooltip-row">
            <span>Per Analysis:</span>
            <span className="tooltip-value">1 credit</span>
          </div>

          {creditStatus.welcomeUsed ? (
            <>
              <div className="tooltip-row">
                <span>Daily Free:</span>
                <span className="tooltip-value">5 credits</span>
              </div>
              <div className="tooltip-row">
                <span>Next Refresh:</span>
                <span className="tooltip-value" style={{ fontSize: '0.85rem' }}>
                  {formatTimeUntilRefresh()}
                </span>
              </div>
            </>
          ) : (
            <div className="tooltip-info" style={{
              background: darkMode ? '#2a2a2a' : '#f9fafb',
              padding: '0.5rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              marginTop: '0.5rem'
            }}>
              <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.25rem' }}>
                Welcome Bonus Active!
              </div>
              <div>
                After using these 10 credits, you'll receive 3 free credits daily.
              </div>
            </div>
          )}

          {credits === 0 && (
            <div className="tooltip-warning" style={{
              background: '#fef2f2',
              color: '#dc2626',
              padding: '0.5rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              marginTop: '0.5rem',
              border: '1px solid #fecaca'
            }}>
              Out of credits! Check back tomorrow for your daily refresh.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CreditCounter;
