import { useState, useEffect } from 'react';
import './App.css';
import InputForm from './components/InputForm';
import ResultsTable from './components/ResultsTable';
import TrendChart from './components/TrendChart';
import QuickStats from './components/QuickStats';
import Calculator from './components/Calculator';
import About from './components/About';
import CreditCounter from './components/CreditCounter';
import CreditWarningModal from './components/CreditWarningModal';
import CreditInfoPage from './components/CreditInfoPage';
import Toast from './components/Toast';
import {
  initializeCreditSystem,
  deductCredits,
  getCurrentCredits,
  getCreditStatus,
  checkAndRefreshDailyCredits
} from './utils/creditManager';
import { initializeAdminHelpers } from './utils/adminHelpers';

// Use environment variable for API URL, fallback to production API, or localhost for dev
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api');

function App() {
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze', 'calculator', 'about', 'credits-info'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [focusedWords, setFocusedWords] = useState([]); // Multi-select array
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [polymarketData, setPolymarketData] = useState(null); // Store PolyMarket data
  const [showHighConsistency, setShowHighConsistency] = useState(false); // Filter for 75%+ consistency

  // Credit system state
  const [credits, setCredits] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'welcome', 'low-credits', 'no-credits'

  // Toast notification state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  // Initialize credit system on mount
  useEffect(() => {
    const creditInfo = initializeCreditSystem();
    setCredits(creditInfo.credits);

    // Show welcome modal for ALL users on first visit
    // Check if they've seen the credit system intro
    const hasSeenIntro = localStorage.getItem('earningsEdgeSeenIntro');
    if (!hasSeenIntro) {
      setModalType('welcome');
      setShowModal(true);
      localStorage.setItem('earningsEdgeSeenIntro', 'true');
    }

    // Check for daily refresh
    checkAndRefreshDailyCredits();

    // Initialize admin helpers (dev mode only)
    initializeAdminHelpers();
  }, []);

  // Show toast notification
  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ visible: true, message, type, duration });
  };

  const handleAnalyze = async (ticker, words, polymarketData = null) => {
    // Check if user has enough credits
    const currentCredits = getCurrentCredits();
    if (currentCredits < 1) {
      setModalType('no-credits');
      setShowModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResults(null);
    setFocusedWords([]);
    setShowHighConsistency(false); // Reset filter on new analysis
    setPolymarketData(polymarketData);

    try {
      // Step 1: Fetch transcripts
      const transcriptResponse = await fetch(`${API_BASE_URL}/transcripts/${ticker}`);

      if (!transcriptResponse.ok) {
        const errorData = await transcriptResponse.json();
        throw new Error(errorData.message || `Failed to fetch transcripts for ${ticker}`);
      }

      const transcriptData = await transcriptResponse.json();

      // Step 2: Analyze word frequency
      const analysisResponse = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker,
          words,
          transcripts: transcriptData.transcripts
        })
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.message || 'Failed to analyze transcripts');
      }

      const analysisData = await analysisResponse.json();
      setAnalysisResults(analysisData);

      // Deduct credit after successful analysis
      const deductionResult = deductCredits(1);
      if (deductionResult.success) {
        setCredits(deductionResult.remainingCredits);

        // Show toast notification
        showToast(
          `Credit used - ${deductionResult.remainingCredits} remaining`,
          'credit',
          3000
        );

        // Show low credit warning if they have 2 or fewer credits left
        if (deductionResult.remainingCredits <= 2 && deductionResult.remainingCredits > 0) {
          setTimeout(() => {
            setModalType('low-credits');
            setShowModal(true);
          }, 2000); // Delay so they see results and toast first
        }
      }

    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle credit updates from CreditCounter
  const handleCreditUpdate = (newCredits, status) => {
    setCredits(newCredits);
  };

  const handleWordClick = (word) => {
    // Toggle: add/remove word from focusedWords array
    setFocusedWords(prevWords => {
      if (prevWords.includes(word)) {
        // Remove word if already selected
        return prevWords.filter(w => w !== word);
      } else {
        // Add word to selection
        return [...prevWords, word];
      }
    });
  };

  const handleExportCSV = () => {
    if (!analysisResults) return;

    // Prepare CSV data
    const headers = ['Word', ...analysisResults.analyzedWords[0].quarters.map(q => q.quarter), 'Total', 'Average'];
    const rows = analysisResults.analyzedWords.map(wordData => [
      wordData.word,
      ...wordData.quarters.map(q => q.count),
      wordData.total,
      wordData.average
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysisResults.ticker}_earnings_analysis.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <div className="header-left">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="header-center">
          <h1>⚡ EarningsEdge</h1>
          <p className="subtitle">Analyze word frequency trends in earnings calls for PolyMarket insights</p>
        </div>
        <div className="header-right">
          <CreditCounter
            onCreditUpdate={handleCreditUpdate}
            darkMode={darkMode}
          />
        </div>
      </header>

      {/* Credit Warning Modal */}
      <CreditWarningModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        warningType={modalType}
        darkMode={darkMode}
      />

      {/* Tab Navigation */}
      <nav className="tabs-container">
        <button
          className={`tab ${activeTab === 'analyze' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyze')}
        >
          <span className="tab-icon">🔍</span>
          <span className="tab-label">Analyze</span>
        </button>
        <button
          className={`tab ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <span className="tab-icon">💰</span>
          <span className="tab-label">Calculator</span>
        </button>
        <button
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <span className="tab-icon">📖</span>
          <span className="tab-label">About</span>
        </button>
        <button
          className={`tab ${activeTab === 'credits-info' ? 'active' : ''}`}
          onClick={() => setActiveTab('credits-info')}
        >
          <span className="tab-icon">⚡</span>
          <span className="tab-label">How Credits Work</span>
        </button>
      </nav>

      <main className="app-main">
        {/* Analyze Tab Content */}
        {activeTab === 'analyze' && (
          <>
            <InputForm onAnalyze={handleAnalyze} loading={loading} />

        {error && (
          <div className="error-message">
            ⚠️ Error: {error}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            🔄 Analyzing transcripts...
          </div>
        )}

        {analysisResults && (
          <div className="results-container">
            <div className="results-header">
              <h2>
                Results for {analysisResults.ticker}
              </h2>
              <button className="export-btn" onClick={handleExportCSV}>
                📥 Export CSV
              </button>
            </div>

            {/* Word Filter */}
            {analysisResults.analyzedWords.length > 1 && (
              <div className="word-filter-container" style={{
                background: darkMode ? '#1e1e1e' : 'white',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: darkMode ? '1px solid #444444' : '1px solid #e5e7eb',
                boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <strong style={{ color: darkMode ? '#E0E0E0' : '#374151' }}>Filter Words:</strong>
                  <button
                    onClick={() => setFocusedWords([])}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: focusedWords.length === 0 ? '2px solid #888888' : `1px solid ${darkMode ? '#444444' : '#d1d5db'}`,
                      background: focusedWords.length === 0 ? '#888888' : (darkMode ? '#0a0a0a' : '#fff'),
                      color: focusedWords.length === 0 ? '#E0E0E0' : (darkMode ? '#E0E0E0' : '#374151'),
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: focusedWords.length === 0 ? 'bold' : 'normal',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    All Words
                  </button>
                  {analysisResults.analyzedWords.map((wordData) => (
                    <button
                      key={wordData.word}
                      onClick={() => handleWordClick(wordData.word)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: focusedWords.includes(wordData.word) ? '2px solid #888888' : `1px solid ${darkMode ? '#444444' : '#d1d5db'}`,
                        background: focusedWords.includes(wordData.word) ? '#888888' : (darkMode ? '#0a0a0a' : '#fff'),
                        color: focusedWords.includes(wordData.word) ? '#E0E0E0' : (darkMode ? '#E0E0E0' : '#374151'),
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: focusedWords.includes(wordData.word) ? 'bold' : 'normal',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {wordData.word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* High Consistency Filter */}
            {analysisResults.analyzedWords.length > 1 && (() => {
              const highConsistencyWords = analysisResults.analyzedWords.filter(
                wordData => parseFloat(wordData.consistencyPercent) >= 75
              );
              const count = highConsistencyWords.length;

              return (
                <div className="high-consistency-filter" style={{
                  background: darkMode ? '#1e1e1e' : 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  border: darkMode ? '1px solid #444444' : '1px solid #e5e7eb',
                  boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setShowHighConsistency(!showHighConsistency)}
                      style={{
                        padding: '0.75rem 1.25rem',
                        borderRadius: '8px',
                        border: showHighConsistency ? '2px solid #10b981' : `2px solid ${darkMode ? '#444444' : '#d1d5db'}`,
                        background: showHighConsistency ? '#10b981' : (darkMode ? '#0a0a0a' : '#fff'),
                        color: showHighConsistency ? 'white' : (darkMode ? '#E0E0E0' : '#374151'),
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>🟢</span>
                      <span>{showHighConsistency ? 'Showing' : 'Show'} High Consistency (75%+)</span>
                    </button>
                    <span style={{
                      color: darkMode ? '#B0B0B0' : '#6b7280',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      {count} reliable {count === 1 ? 'word' : 'words'} found (6+ out of 8 quarters)
                    </span>
                  </div>
                </div>
              );
            })()}

            <ResultsTable
              data={analysisResults.analyzedWords}
              focusedWords={focusedWords}
              showHighConsistency={showHighConsistency}
            />
            <QuickStats
              data={analysisResults.analyzedWords}
              focusedWords={focusedWords}
              showHighConsistency={showHighConsistency}
              onWordClick={handleWordClick}
              polymarketData={polymarketData}
              onCalculate={() => setActiveTab('calculator')}
            />
            <TrendChart
              data={analysisResults.analyzedWords}
              focusedWords={focusedWords}
              showHighConsistency={showHighConsistency}
            />
          </div>
        )}
          </>
        )}

        {/* Calculator Tab Content */}
        {activeTab === 'calculator' && <Calculator />}

        {/* Credits Info Tab Content */}
        {activeTab === 'credits-info' && <CreditInfoPage darkMode={darkMode} />}

        {/* About Tab Content */}
        {activeTab === 'about' && <About onTabChange={setActiveTab} />}
      </main>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
        duration={toast.duration}
      />

      <footer className="app-footer">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: darkMode ? '#E0E0E0' : '#374151'
          }}>
            ⚡ EarningsEdge
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0 }}>Built for PolyMarket traders • Data from last 8 quarters</p>
            <p style={{ fontSize: '0.85rem', color: darkMode ? '#888888' : '#888', marginTop: '5px', margin: 0 }}>
              Data presentation only, not financial advice
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
