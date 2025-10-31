import { useState, useEffect } from 'react';
import { getCreditStatus, CREDIT_SYSTEM } from '../utils/creditManager';
import './CreditInfoPage.css';

function CreditInfoPage({ darkMode }) {
  const [status, setStatus] = useState(null);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const creditStatus = getCreditStatus();
    setStatus(creditStatus);

    const sid = localStorage.getItem(CREDIT_SYSTEM.KEYS.SESSION_ID) || 'Not assigned';
    setSessionId(sid);
  }, []);

  if (!status) return null;

  return (
    <div className="credit-info-page" style={{
      background: darkMode ? '#0a1929' : '#f9fafb',
      minHeight: '100%',
      padding: '2rem'
    }}>
      <div className="credit-info-container" style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: darkMode ? '#1e1e1e' : 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.5)' : '0 4px 6px rgba(0,0,0,0.1)'
      }}>

        {/* Header */}
        <div className="info-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            ⚡ How Credits Work
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
            Free credits daily + optional upgrades coming soon
          </p>
        </div>

        {/* Current Status Card */}
        <div className="current-status-card" style={{
          background: darkMode ? '#2a2a2a' : '#f0fdf4',
          border: darkMode ? '2px solid #2a4a3a' : '2px solid #86efac',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#10b981' }}>
            Your Current Status
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Credits</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                {status.totalCredits}
              </div>
            </div>
            {status.purchasedCredits > 0 && (
              <>
                <div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Free Credits</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {status.freeCredits}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Purchased</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {status.purchasedCredits}
                  </div>
                </div>
              </>
            )}
            <div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Status</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: status.welcomeUsed ? '#6b7280' : '#10b981' }}>
                {status.welcomeUsed ? 'Daily Credits' : 'Welcome Bonus'}
              </div>
            </div>
          </div>
          {status.welcomeUsed && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: darkMode ? '#1e1e1e' : 'white', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                Next refresh in:
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {status.timeUntilRefresh.hours}h {status.timeUntilRefresh.minutes}m
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="info-section" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎯</span> How It Works
          </h2>
          <div style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
            <div style={{
              background: darkMode ? '#2a2a2a' : '#f9fafb',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <strong style={{ color: '#10b981' }}>1 Credit = 1 Company Analysis</strong>
              <div style={{ fontSize: '0.95rem', opacity: 0.8, marginTop: '0.25rem' }}>
                Each transcript analysis costs 1 credit
              </div>
            </div>
          </div>
        </div>

        {/* Credit Tiers */}
        <div className="info-section" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎁</span> Credit Tiers
          </h2>

          {/* Welcome Tier */}
          <div className="tier-card" style={{
            background: darkMode ? '#2a2a2a' : 'white',
            border: darkMode ? '2px solid #444' : '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>🌟 Welcome Bonus</h3>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>10 Credits</span>
            </div>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>One-time bonus for new users</li>
              <li>Try the platform risk-free</li>
              <li>Analyze up to 10 companies</li>
              <li>No payment required</li>
            </ul>
          </div>

          {/* Daily Free */}
          <div className="tier-card" style={{
            background: darkMode ? '#2a2a2a' : 'white',
            border: darkMode ? '2px solid #444' : '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>🌅 Daily Free</h3>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6' }}>3 Credits/Day</span>
            </div>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Automatically added at midnight UTC</li>
              <li>After using your welcome bonus</li>
              <li>Capped at 10 free credits total</li>
              <li>Perfect for casual users</li>
            </ul>
          </div>

          {/* Coming Soon - Purchased */}
          <div className="tier-card" style={{
            background: darkMode ? '#1e3a2a' : '#f0fdf4',
            border: darkMode ? '2px solid #2a4a3a' : '2px solid #86efac',
            borderRadius: '12px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: '#10b981',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}>
              COMING SOON
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', margin: 0, color: '#10b981' }}>💎 Unlimited Credits</h3>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>Pay with USDC</span>
            </div>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8', color: darkMode ? '#86efac' : '#16a34a' }}>
              <li>Buy credit bundles that never expire</li>
              <li>Pay with cryptocurrency via Coinbase Commerce</li>
              <li>Instant delivery after confirmation</li>
              <li>Perfect for power users and traders</li>
              <li>Volume discounts on larger bundles</li>
            </ul>
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: darkMode ? '#2a4a3a' : 'white',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                🚀 Infrastructure ready - launching soon!
              </div>
              <button
                disabled
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'not-allowed',
                  opacity: 0.6
                }}
              >
                Buy Credits (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* Why Credits? */}
        <div className="info-section" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💡</span> Why Credits?
          </h2>
          <div style={{
            background: darkMode ? '#2a2a2a' : '#f9fafb',
            padding: '1.5rem',
            borderRadius: '12px',
            lineHeight: '1.8'
          }}>
            <p style={{ marginBottom: '1rem' }}>
              Our generous free tier (10 welcome + 3 daily) lets you validate your trading strategies without any upfront cost. This model keeps API costs sustainable while giving you plenty of free analyses.
            </p>
            <p style={{ margin: 0 }}>
              Power users who need unlimited analyses can purchase credit bundles (coming soon). This ensures the tool remains free for most users while being sustainable long-term.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="info-section" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>❓</span> Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <details style={{
              background: darkMode ? '#2a2a2a' : 'white',
              padding: '1rem',
              borderRadius: '8px',
              border: darkMode ? '1px solid #444' : '1px solid #e5e7eb'
            }}>
              <summary style={{ fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem' }}>
                What timezone is used for daily refresh?
              </summary>
              <p style={{ marginTop: '0.5rem', paddingLeft: '1rem', opacity: 0.9 }}>
                Credits refresh at midnight UTC (Coordinated Universal Time) for consistency worldwide.
              </p>
            </details>

            <details style={{
              background: darkMode ? '#2a2a2a' : 'white',
              padding: '1rem',
              borderRadius: '8px',
              border: darkMode ? '1px solid #444' : '1px solid #e5e7eb'
            }}>
              <summary style={{ fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem' }}>
                What happens if I clear my browser data?
              </summary>
              <p style={{ marginTop: '0.5rem', paddingLeft: '1rem', opacity: 0.9 }}>
                You'll be treated as a new user and receive 10 welcome credits again. In the future, purchased credits will be tied to your account.
              </p>
            </details>

            <details style={{
              background: darkMode ? '#2a2a2a' : 'white',
              padding: '1rem',
              borderRadius: '8px',
              border: darkMode ? '1px solid #444' : '1px solid #e5e7eb'
            }}>
              <summary style={{ fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem' }}>
                Can I use credits across multiple devices?
              </summary>
              <p style={{ marginTop: '0.5rem', paddingLeft: '1rem', opacity: 0.9 }}>
                Currently, credits are stored locally in your browser. When we launch purchased credits, we'll add account sync across devices.
              </p>
            </details>

            <details style={{
              background: darkMode ? '#2a2a2a' : 'white',
              padding: '1rem',
              borderRadius: '8px',
              border: darkMode ? '1px solid #444' : '1px solid #e5e7eb'
            }}>
              <summary style={{ fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem' }}>
                Will purchased credits ever expire?
              </summary>
              <p style={{ marginTop: '0.5rem', paddingLeft: '1rem', opacity: 0.9 }}>
                No! Purchased credits never expire. Only free daily credits are capped at 10.
              </p>
            </details>

            <details style={{
              background: darkMode ? '#2a2a2a' : 'white',
              padding: '1rem',
              borderRadius: '8px',
              border: darkMode ? '1px solid #444' : '1px solid #e5e7eb'
            }}>
              <summary style={{ fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem' }}>
                Why Coinbase Commerce for payments?
              </summary>
              <p style={{ marginTop: '0.5rem', paddingLeft: '1rem', opacity: 0.9 }}>
                Coinbase Commerce enables secure crypto payments (USDC, BTC, ETH) without complex merchant accounts. Perfect for our trader audience.
              </p>
            </details>
          </div>
        </div>

        {/* Session Info */}
        <div className="info-section" style={{
          background: darkMode ? '#2a2a2a' : '#f9fafb',
          padding: '1.5rem',
          borderRadius: '12px',
          border: darkMode ? '1px solid #444' : '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            🔑 Your Session Info
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ opacity: 0.8 }}>Session ID:</span>
              <code style={{
                background: darkMode ? '#1e1e1e' : 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontFamily: 'monospace'
              }}>
                {sessionId}
              </code>
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
              This unique ID will be used to link future credit purchases to your account.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CreditInfoPage;
