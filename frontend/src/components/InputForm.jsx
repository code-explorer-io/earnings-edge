import { useState } from 'react';
import './InputForm.css';

function InputForm({ onAnalyze, loading }) {
  const [ticker, setTicker] = useState('SBUX');
  const [wordsInput, setWordsInput] = useState('holiday, pumpkin, rewards, mobile');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Parse words from comma-separated input
    const words = wordsInput
      .split(',')
      .map(word => word.trim())
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
        </div>

        <div className="form-group">
          <label htmlFor="words">Words to Track (comma-separated)</label>
          <textarea
            id="words"
            value={wordsInput}
            onChange={(e) => setWordsInput(e.target.value)}
            placeholder="e.g., holiday, pumpkin, rewards, mobile"
            disabled={loading}
            rows="3"
            className="words-input"
          />
          <small className="help-text">Enter words from PolyMarket markets, separated by commas</small>
        </div>

        <button type="submit" disabled={loading} className="analyze-btn">
          {loading ? '🔄 Analyzing...' : '🔍 Analyze Transcripts'}
        </button>
      </form>
    </div>
  );
}

export default InputForm;
