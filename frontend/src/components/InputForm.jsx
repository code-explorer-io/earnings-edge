import { useState, useRef, useEffect } from 'react';
import './InputForm.css';
import { top100Companies, searchCompanies } from '../data/top100Companies';

function InputForm({ onAnalyze, loading }) {
  const [viewMode, setViewMode] = useState('input'); // 'input' or 'preview'
  const [companyInput, setCompanyInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [extractedWords, setExtractedWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState(new Set());
  const [customWord, setCustomWord] = useState('');
  const [validationError, setValidationError] = useState(null);

  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  // Junk words to filter out during extraction
  const junkWords = new Set([
    // UI/PolyMarket terms
    'outcome', 'chance', 'buy', 'yes', 'no', 'vol', 'volume', 'price', 'market',
    'traders', 'trade', 'trading', 'event', 'question', 'outcome', 'ends',
    // Common English words
    'the', 'and', 'or', 'of', 'to', 'in', 'a', 'is', 'it', 'on', 'for', 'with',
    'as', 'by', 'at', 'from', 'be', 'this', 'that', 'will', 'their', 'has',
    'have', 'was', 'were', 'been', 'are', 'an', 'but', 'if', 'can', 'not',
    // Time/date
    'today', 'tomorrow', 'yesterday', 'week', 'month', 'year', 'day', 'time',
    'date', 'hours', 'minutes', 'seconds',
    // Other
    'during', 'when', 'where', 'what', 'who', 'how', 'why', 'which', 'there',
    'here', 'then', 'than', 'them', 'these', 'those', 'such', 'some', 'any',
    'all', 'both', 'each', 'few', 'more', 'most', 'other', 'another', 'much',
    'many', 'said', 'says', 'say', 'call', 'called', 'calls'
  ]);

  // Whitelist for short words that should be kept
  const shortWordWhitelist = new Set(['ai', 'ar', 'vr', 'ip', 'io', 'ceo', 'cfo', 'cto']);

  // Convert company name to ticker
  const convertNameToTicker = (input) => {
    const searchTerm = input.toLowerCase().trim();
    const company = top100Companies.find(c =>
      c.name.toLowerCase() === searchTerm ||
      c.ticker.toLowerCase() === searchTerm
    );
    return company ? company.ticker : input.toUpperCase();
  };

  // Autocomplete: Handle input change
  const handleCompanyInputChange = (e) => {
    const value = e.target.value;
    setCompanyInput(value);

    if (value.trim().length > 0) {
      const results = searchCompanies(value);
      setFilteredCompanies(results.slice(0, 10)); // Limit to 10 results
      setShowAutocomplete(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setShowAutocomplete(false);
      setFilteredCompanies([]);
    }
  };

  // Autocomplete: Select a company
  const selectCompany = (company) => {
    setCompanyInput(company.ticker);
    setShowAutocomplete(false);
    setFilteredCompanies([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Autocomplete: Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showAutocomplete) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredCompanies.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredCompanies.length) {
          selectCompany(filteredCompanies[selectedIndex]);
        } else {
          setShowAutocomplete(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowAutocomplete(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Autocomplete: Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowAutocomplete(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Smart text extraction
  const extractKeywords = (text) => {
    if (!text || !text.trim()) return [];

    // FIRST: Split on " / " pattern to handle variations (e.g., "Shutdown / Shut Down")
    // Replace " / " with a unique delimiter that we'll split on later
    let preprocessed = text.replace(/\s+\/\s+/g, '|||VARIANT|||');

    // First split by newlines to preserve line boundaries
    const lines = preprocessed.split(/\n+/);

    // Process each line separately
    const allTokens = [];

    for (let line of lines) {
      // Remove common symbols and clean text
      let cleaned = line
        .replace(/[$¢%]/g, ' ')  // Remove currency symbols and percent
        .replace(/\b\d+\b/g, (match, offset, string) => {
          // Keep numbers if they're part of a phrase (preceded by a letter or followed by a letter)
          // e.g., "Windows 10", "RTX 6000", but remove standalone numbers like "88", "123"
          const before = string[offset - 1];
          const after = string[offset + match.length];
          const hasLetterBefore = before && /[a-zA-Z]/.test(before);
          const hasLetterAfter = after && /[a-zA-Z]/.test(after);

          // Keep the number if it has a letter before or after (part of a phrase)
          if (hasLetterBefore || hasLetterAfter) {
            return match;
          }
          // Remove standalone numbers
          return ' ';
        })
        .replace(/[^\w\s'\-|]/g, ' ')  // Keep only words, spaces, hyphens, apostrophes, and our delimiter
        .replace(/\s+/g, ' ')    // Normalize whitespace
        .trim();

      if (!cleaned) continue;

      // Split by various separators AND our variant delimiter within each line
      const lineTokens = cleaned.split(/[,;\t]|(\|\|\|VARIANT\|\|\|)+/)
        .filter(token => token && token.trim() && token !== '|||VARIANT|||');

      allTokens.push(...lineTokens);
    }

    const tokens = allTokens;

    const potentialWords = [];

    for (let token of tokens) {
      token = token.trim();
      if (!token) continue;

      // Split token by spaces to get individual words and multi-word phrases
      const words = token.split(/\s+/);

      // Check for multi-word phrases (consecutive capitalized words)
      let i = 0;
      while (i < words.length) {
        const word = words[i];

        // Skip if too short (unless whitelisted or a number)
        const wordLower = word.toLowerCase();
        const isNumber = /^\d+$/.test(word);
        if (word.length < 3 && !shortWordWhitelist.has(wordLower) && !isNumber) {
          i++;
          continue;
        }

        // Skip junk words
        if (junkWords.has(wordLower)) {
          i++;
          continue;
        }

        // Helper: Check if word starts with capital letter
        const startsWithCapital = /^[A-Z]/.test(word);
        // isNumber already defined above
        const isCapitalizedOrNumber = startsWithCapital || isNumber;

        // Check if this starts a multi-word phrase
        if (i < words.length - 1 && startsWithCapital) {
          // Check if next word is capitalized or a number
          const nextStartsWithCapital = /^[A-Z]/.test(words[i + 1]);
          const nextIsNumber = /^\d+$/.test(words[i + 1]);

          if (nextStartsWithCapital || nextIsNumber) {
            // Potential multi-word phrase
            let phrase = word;
            let j = i + 1;
            while (j < words.length && j - i < 4) { // Limit phrase length to 4 words
              const currentStartsWithCapital = /^[A-Z]/.test(words[j]);
              const currentIsNumber = /^\d+$/.test(words[j]);

              // Continue if word is capitalized or a number, and not junk
              if ((currentStartsWithCapital || currentIsNumber) && !junkWords.has(words[j].toLowerCase())) {
                phrase += ' ' + words[j];
                j++;
              } else {
                break;
              }
            }
            if (j > i + 1) {
              potentialWords.push(phrase);
              i = j;
              continue;
            }
          }
        }

        // Single word - keep if it looks like a proper noun or keyword
        if (startsWithCapital || wordLower === word.toUpperCase()) {
          potentialWords.push(word);
        }

        i++;
      }
    }

    // Remove duplicates while preserving order
    return [...new Set(potentialWords)];
  };

  // Handle extract & preview
  const handleExtractWords = () => {
    setValidationError(null);

    if (!textInput.trim()) {
      setValidationError('Please enter text or words to track');
      return;
    }

    const words = extractKeywords(textInput);

    if (words.length === 0) {
      setValidationError('No tracking words detected. Try typing them manually, one per line or comma-separated.');
      return;
    }

    setExtractedWords(words);
    setSelectedWords(new Set(words)); // Select all by default
    setViewMode('preview');
  };

  // Toggle word selection
  const toggleWord = (word) => {
    const newSelected = new Set(selectedWords);
    if (newSelected.has(word)) {
      newSelected.delete(word);
    } else {
      newSelected.add(word);
    }
    setSelectedWords(newSelected);
  };

  // Select/deselect all
  const selectAll = () => setSelectedWords(new Set(extractedWords));
  const clearAll = () => setSelectedWords(new Set());

  // Add custom word
  const handleAddCustomWord = () => {
    const word = customWord.trim();
    if (!word) return;

    if (!extractedWords.includes(word)) {
      setExtractedWords([...extractedWords, word]);
    }
    setSelectedWords(new Set([...selectedWords, word]));
    setCustomWord('');
  };

  // Handle final analysis
  const handleAnalyze = () => {
    setValidationError(null);

    if (selectedWords.size === 0) {
      setValidationError('Please select at least one word to track');
      return;
    }

    if (!companyInput.trim()) {
      setValidationError('Please enter a company ticker or name');
      return;
    }

    const finalTicker = convertNameToTicker(companyInput);
    const words = Array.from(selectedWords);

    onAnalyze(finalTicker, words, null);
  };

  // Back to edit
  const handleBackToEdit = () => {
    setViewMode('input');
    setValidationError(null);
  };

  const charCount = textInput.length;
  const charLimit = 5000;

  return (
    <div className="input-form-container">
      {viewMode === 'input' ? (
        // INPUT MODE
        <div className="input-mode">
          <div className="form-header">
            <span className="form-icon">📝</span>
            <h3>ANALYZE EARNINGS MENTIONS</h3>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleExtractWords(); }}>
            <div className="form-group">
              <label htmlFor="company">Company Ticker or Name:</label>
              <div className="autocomplete-container" ref={autocompleteRef}>
                <input
                  type="text"
                  id="company"
                  ref={inputRef}
                  value={companyInput}
                  onChange={handleCompanyInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="SBUX or Starbucks"
                  disabled={loading}
                  className="full-width-input"
                  autoComplete="off"
                />
                {showAutocomplete && filteredCompanies.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {filteredCompanies.map((company, index) => (
                      <div
                        key={`${company.ticker}-${index}`}
                        className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                        onClick={() => selectCompany(company)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <span className="company-ticker">{company.ticker}</span>
                        <span className="company-separator"> - </span>
                        <span className="company-name">{company.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <small className="help-text">
                Start typing to see suggestions (e.g., AAPL, Apple, Tesla)
              </small>
              <small className="help-text ticker-search-link">
                Don't know the ticker?{' '}
                <a
                  href="https://finance.yahoo.com/lookup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  Search here
                </a>
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="text-input">Paste text from PolyMarket or enter words:</label>
              <textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`You can paste messy text from PolyMarket:\n"Foundry 99¢ Holiday Protein $36 Vol..."\n\nOR just type words:\nHoliday, Protein, Canada\n\nOR one per line:\nHoliday\nProtein\nCanada`}
                disabled={loading}
                className="text-input-area"
                rows={8}
                maxLength={charLimit}
              />
              <div className="textarea-footer">
                <small className="help-text">
                  Paste any text - we'll extract the keywords automatically
                </small>
                <small className="char-count" style={{ color: charCount > charLimit * 0.9 ? '#ef4444' : '#6b7280' }}>
                  {charCount}/{charLimit}
                </small>
              </div>
            </div>

            {validationError && (
              <div className="error-box">
                ⚠️ {validationError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !textInput.trim()}
              className="extract-btn"
            >
              🔍 Extract & Preview Words
            </button>
          </form>
        </div>
      ) : (
        // PREVIEW MODE
        <div className="preview-mode">
          <div className="form-header">
            <span className="form-icon">✓</span>
            <h3>FOUND {extractedWords.length} POTENTIAL WORD{extractedWords.length !== 1 ? 'S' : ''}</h3>
          </div>

          <div className="preview-content">
            <p className="preview-instructions">
              Select words to analyze ({selectedWords.size} selected):
            </p>

            <div className="words-checklist">
              {extractedWords.map((word, idx) => (
                <label key={idx} className="word-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedWords.has(word)}
                    onChange={() => toggleWord(word)}
                    disabled={loading}
                  />
                  <span className="checkbox-label">{word}</span>
                </label>
              ))}
            </div>

            <div className="selection-controls">
              <button onClick={selectAll} className="control-btn" disabled={loading}>
                ✓ Select All
              </button>
              <button onClick={clearAll} className="control-btn" disabled={loading}>
                ✗ Clear All
              </button>
            </div>

            <div className="custom-word-section">
              <label htmlFor="custom-word">Add custom word:</label>
              <div className="custom-word-input">
                <input
                  type="text"
                  id="custom-word"
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomWord())}
                  placeholder="Type a word..."
                  disabled={loading}
                  className="custom-input"
                />
                <button
                  onClick={handleAddCustomWord}
                  disabled={loading || !customWord.trim()}
                  className="add-btn"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="company-preview">Company:</label>
              <div className="autocomplete-container" ref={autocompleteRef}>
                <input
                  type="text"
                  id="company-preview"
                  ref={inputRef}
                  value={companyInput}
                  onChange={handleCompanyInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter ticker or name (required)"
                  disabled={loading}
                  className="full-width-input"
                  autoComplete="off"
                />
                {showAutocomplete && filteredCompanies.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {filteredCompanies.map((company, index) => (
                      <div
                        key={`${company.ticker}-${index}`}
                        className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                        onClick={() => selectCompany(company)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <span className="company-ticker">{company.ticker}</span>
                        <span className="company-separator"> - </span>
                        <span className="company-name">{company.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <small className="help-text ticker-search-link">
                Don't know the ticker?{' '}
                <a
                  href="https://finance.yahoo.com/lookup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  Search here
                </a>
              </small>
            </div>

            {validationError && (
              <div className="error-box">
                ⚠️ {validationError}
              </div>
            )}

            <div className="preview-actions">
              <button
                onClick={handleBackToEdit}
                className="back-btn"
                disabled={loading}
              >
                ← Back to Edit
              </button>
              <button
                onClick={handleAnalyze}
                className="analyze-btn"
                disabled={loading || selectedWords.size === 0}
              >
                {loading ? '🔄 Analyzing...' : `Analyze Selected Words →`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InputForm;
