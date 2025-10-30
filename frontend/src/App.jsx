import { useState } from 'react';
import './App.css';
import InputForm from './components/InputForm';
import ResultsTable from './components/ResultsTable';
import TrendChart from './components/TrendChart';
import QuickStats from './components/QuickStats';
import Calculator from './components/Calculator';
import About from './components/About';

// Use environment variable for API URL, fallback to production API, or localhost for dev
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api');

function App() {
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze', 'calculator', 'about'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [focusedWords, setFocusedWords] = useState([]); // Multi-select array
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [polymarketData, setPolymarketData] = useState(null); // Store PolyMarket data

  const handleAnalyze = async (ticker, words, polymarketData = null) => {
    setLoading(true);
    setError(null);
    setAnalysisResults(null);
    setFocusedWords([]);
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

    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
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
    const headers = ['Word', ...analysisResults.analyzedWords[0].quarters.map(q => q.quarter), 'Total', 'Average', 'Trend'];
    const rows = analysisResults.analyzedWords.map(wordData => [
      wordData.word,
      ...wordData.quarters.map(q => q.count),
      wordData.total,
      wordData.average,
      wordData.trend
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
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <h1>⚡ EarningsEdge</h1>
        <p className="subtitle">Analyze word frequency trends in earnings calls for PolyMarket insights</p>
      </header>

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

            <ResultsTable
              data={analysisResults.analyzedWords}
              focusedWords={focusedWords}
            />
            <QuickStats
              data={analysisResults.analyzedWords}
              focusedWords={focusedWords}
              onWordClick={handleWordClick}
              polymarketData={polymarketData}
              onCalculate={() => setActiveTab('calculator')}
            />
            <TrendChart
              data={analysisResults.analyzedWords}
              focusedWords={focusedWords}
            />
          </div>
        )}
          </>
        )}

        {/* Calculator Tab Content */}
        {activeTab === 'calculator' && <Calculator />}

        {/* About Tab Content */}
        {activeTab === 'about' && <About />}
      </main>

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
