import { useState } from 'react';
import './InputForm.css';
import { top100Companies } from '../data/top100Companies';

function InputForm({ onAnalyze, loading }) {
  const [viewMode, setViewMode] = useState('input'); // 'input' or 'preview'
  const [companyInput, setCompanyInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [extractedWords, setExtractedWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState(new Set());
  const [customWord, setCustomWord] = useState('');
  const [validationError, setValidationError] = useState(null);

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

  // Smart text extraction
  const extractKeywords = (text) => {
    if (!text || !text.trim()) return [];

    // Remove common symbols and clean text
    let cleaned = text
      .replace(/[$¢%]/g, ' ')  // Remove currency symbols and percent
      .replace(/\d+/g, ' ')    // Remove numbers
      .replace(/[^\w\s'-]/g, ' ')  // Keep only words, spaces, hyphens, apostrophes
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();

    // Split by various separators
    const tokens = cleaned.split(/[,;\n\t]+/);

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

        // Skip if too short (unless whitelisted)
        const wordLower = word.toLowerCase();
        if (word.length < 3 && !shortWordWhitelist.has(wordLower)) {
          i++;
          continue;
        }

        // Skip junk words
        if (junkWords.has(wordLower)) {
          i++;
          continue;
        }

        // Check if this starts a multi-word phrase
        if (i < words.length - 1 &&
            word[0] === word[0].toUpperCase() &&
            words[i + 1][0] === words[i + 1][0].toUpperCase()) {
          // Potential multi-word phrase
          let phrase = word;
          let j = i + 1;
          while (j < words.length &&
                 words[j][0] === words[j][0].toUpperCase() &&
                 !junkWords.has(words[j].toLowerCase()) &&
                 j - i < 4) { // Limit phrase length to 4 words
            phrase += ' ' + words[j];
            j++;
          }
          if (j > i + 1) {
            potentialWords.push(phrase);
            i = j;
            continue;
          }
        }

        // Single word - keep if it looks like a proper noun or keyword
        if (word[0] === word[0].toUpperCase() || wordLower === word.toUpperCase()) {
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
              <input
                type="text"
                id="company"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                placeholder="SBUX or Starbucks"
                disabled={loading}
                className="full-width-input"
              />
              <small className="help-text">
                Examples: SBUX, Starbucks, AAPL, Apple Inc.
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
              <input
                type="text"
                id="company-preview"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                placeholder="Enter ticker or name (required)"
                disabled={loading}
                className="full-width-input"
              />
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
