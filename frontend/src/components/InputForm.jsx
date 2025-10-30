import { useState, useRef, useEffect } from 'react';
import './InputForm.css';
import { searchCompanies } from '../data/top100Companies';

function InputForm({ onAnalyze, loading }) {
  const [ticker, setTicker] = useState('');
  const [wordsInput, setWordsInput] = useState('');
  const [wordTags, setWordTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const results = searchCompanies(query);
      setFilteredCompanies(results);
      setShowDropdown(true);
    } else {
      setFilteredCompanies([]);
      setShowDropdown(false);
    }
  };

  // Handle company selection from dropdown
  const handleCompanySelect = (company) => {
    setTicker(company.ticker);
    setSearchQuery(company.name);
    setShowDropdown(false);
  };

  // Handle adding word tags
  const handleWordsInputChange = (e) => {
    const value = e.target.value;
    setWordsInput(value);

    // Auto-detect comma-separated entries and convert to tags
    if (value.includes(',')) {
      const newWords = value
        .split(',')
        .map(word => word.trim())
        .map(word => word.replace(/\s+/g, ' '))
        .filter(word => word.length > 0 && !wordTags.includes(word));

      if (newWords.length > 0) {
        setWordTags([...wordTags, ...newWords]);
        setWordsInput('');
      }
    }
  };

  // Handle adding a word tag on Enter or blur
  const handleWordsInputKeyDown = (e) => {
    if (e.key === 'Enter' && wordsInput.trim()) {
      e.preventDefault();
      const cleanWord = wordsInput.trim().replace(/\s+/g, ' ');
      if (!wordTags.includes(cleanWord)) {
        setWordTags([...wordTags, cleanWord]);
      }
      setWordsInput('');
    } else if (e.key === 'Backspace' && !wordsInput && wordTags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      setWordTags(wordTags.slice(0, -1));
    }
  };

  // Handle removing a word tag
  const removeWordTag = (indexToRemove) => {
    setWordTags(wordTags.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Add any remaining input as a tag
    if (wordsInput.trim()) {
      const cleanWord = wordsInput.trim().replace(/\s+/g, ' ');
      if (!wordTags.includes(cleanWord)) {
        wordTags.push(cleanWord);
      }
    }

    if (wordTags.length === 0) {
      alert('Please enter at least one word to track');
      return;
    }

    // Use ticker if selected from dropdown, otherwise use searchQuery (for direct ticker entry)
    const finalTicker = ticker.trim() || searchQuery.trim().toUpperCase();

    if (!finalTicker) {
      alert('Please enter a ticker symbol or select a company');
      return;
    }

    onAnalyze(finalTicker, wordTags);
  };

  return (
    <div className="input-form-container">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="form-group" ref={dropdownRef}>
          <label htmlFor="ticker">Company Ticker</label>
          <div className="ticker-input-wrapper">
            <input
              type="text"
              id="ticker-search"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowDropdown(true)}
              placeholder="Search by company name or ticker (e.g., Apple, SBUX)"
              disabled={loading}
              className="ticker-input"
            />
            {showDropdown && filteredCompanies.length > 0 && (
              <div className="autocomplete-dropdown">
                {filteredCompanies.slice(0, 10).map((company) => (
                  <div
                    key={company.ticker}
                    className="autocomplete-item"
                    onClick={() => handleCompanySelect(company)}
                  >
                    <div className="company-info">
                      <span className="company-name">{company.name}</span>
                      <span className="company-ticker">{company.ticker}</span>
                    </div>
                    <div className="company-sector">{company.sector}</div>
                  </div>
                ))}
              </div>
            )}
            {showDropdown && searchQuery && filteredCompanies.length === 0 && (
              <div className="autocomplete-dropdown">
                <div className="autocomplete-item no-results">
                  No companies found. You can enter a ticker directly.
                </div>
              </div>
            )}
          </div>
          <small className="help-text">
            {ticker ? `Selected: ${ticker}` : 'Start typing to search from top 100 US companies'}
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="words">Words to Track</label>
          <div className="tag-input-container">
            {wordTags.map((tag, index) => (
              <div key={index} className="word-tag">
                <span className="tag-text">{tag}</span>
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => removeWordTag(index)}
                  disabled={loading}
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="text"
              id="words"
              value={wordsInput}
              onChange={handleWordsInputChange}
              onKeyDown={handleWordsInputKeyDown}
              placeholder={wordTags.length === 0 ? "Type words and press Enter or comma (e.g., holiday, protein)" : "Add more words..."}
              disabled={loading}
              className="tag-input"
            />
          </div>
          <small className="help-text">
            Press Enter or use commas to add words. Multi-word phrases supported (e.g., "smart queue")
          </small>
        </div>

        <button type="submit" disabled={loading} className="analyze-btn">
          {loading ? '🔄 Analyzing...' : '🔍 Analyze Transcripts'}
        </button>
      </form>
    </div>
  );
}

export default InputForm;
