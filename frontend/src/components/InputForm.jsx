import { useState } from 'react';
import './InputForm.css';

function InputForm({ onAnalyze, loading }) {
  const [ticker, setTicker] = useState('');
  const [wordsInput, setWordsInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Parse words from comma-separated input with whitespace normalization
    const words = wordsInput
      .split(',')
      .map(word => word.trim())                        // Remove leading/trailing whitespace
      .map(word => word.replace(/\s+/g, ' '))          // Collapse multiple spaces into single space
      .filter(word => word.length > 0);

    if (words.length === 0) {
      alert('Please enter at least one word to track');
      return;
    }

    if (!ticker.trim()) {
      alert('Please enter a ticker symbol');
      return;
    }

    onAnalyze(ticker.trim().toUpperCase(), words);
  };

  return (
    <div className="input-form-container">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="form-group">
          <label htmlFor="ticker">Company Ticker</label>
          <input
            type="text"
            id="ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="e.g., SBUX"
            disabled={loading}
            className="ticker-input"
          />
          <small className="help-text">
            Don't know the ticker? <a href="https://finance.yahoo.com/lookup" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'underline' }}>Search for company symbols here</a>
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="words">Words to Track (comma-separated)</label>
          <textarea
            id="words"
            value={wordsInput}
            onChange={(e) => setWordsInput(e.target.value)}
            placeholder="e.g., holiday, protein, smart queue, smart q"
            disabled={loading}
            rows="3"
            className="words-input"
          />
          <small className="help-text">✅ Multi-word phrases supported! Try: "smart queue", "pumpkin spice", etc.</small>
        </div>

        <button type="submit" disabled={loading} className="analyze-btn">
          {loading ? '🔄 Analyzing...' : '🔍 Analyze Transcripts'}
        </button>
      </form>
    </div>
  );
}

export default InputForm;
