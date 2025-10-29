import { useState } from 'react';
import './App.css';
import InputForm from './components/InputForm';
import ResultsTable from './components/ResultsTable';
import TrendChart from './components/TrendChart';
import QuickStats from './components/QuickStats';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleAnalyze = async (ticker, words) => {
    setLoading(true);
    setError(null);
    setAnalysisResults(null);

    try {
      // Step 1: Fetch transcripts
      const transcriptResponse = await fetch(`${API_BASE_URL}/transcripts/${ticker}`);
      if (!transcriptResponse.ok) {
        throw new Error('Failed to fetch transcripts');
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
        throw new Error('Failed to analyze transcripts');
      }

      const analysisData = await analysisResponse.json();
      setAnalysisResults(analysisData);

    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
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
    <div className="app">
      <header className="app-header">
        <h1>📊 Earnings Mention Tracker</h1>
        <p className="subtitle">Analyze word frequency trends in earnings calls for PolyMarket insights</p>
      </header>

      <main className="app-main">
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
              <h2>Results for {analysisResults.ticker}</h2>
              <button className="export-btn" onClick={handleExportCSV}>
                📥 Export CSV
              </button>
            </div>

            <QuickStats data={analysisResults.analyzedWords} />
            <ResultsTable data={analysisResults.analyzedWords} />
            <TrendChart data={analysisResults.analyzedWords} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Built for PolyMarket traders • Data from last 8 quarters</p>
      </footer>
    </div>
  );
}

export default App;
