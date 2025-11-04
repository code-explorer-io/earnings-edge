import React, { useState, useEffect } from 'react';

function KeywordContextModal({ isOpen, onClose, ticker, keyword }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contextData, setContextData] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [currentExcerptIndex, setCurrentExcerptIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    if (isOpen && ticker && keyword) {
      fetchContext();
      setShowAll(false);
      setCurrentExcerptIndex(0);
    }
  }, [isOpen, ticker, keyword]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // ESC to close
      if (e.key === 'Escape') {
        onClose();
      }

      // Arrow keys to navigate excerpts
      if (contextData && contextData.excerpts.length > 0) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          setCurrentExcerptIndex((prev) =>
            Math.min(prev + 1, contextData.excerpts.length - 1)
          );
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          setCurrentExcerptIndex((prev) => Math.max(prev - 1, 0));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, contextData]);

  // Auto-scroll to focused excerpt
  useEffect(() => {
    if (currentExcerptIndex >= 0 && contextData) {
      const element = document.getElementById(`excerpt-${currentExcerptIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentExcerptIndex, contextData]);

  const fetchContext = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/context/${ticker}/${keyword}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch context');
      }

      const data = await response.json();
      setContextData(data);
    } catch (err) {
      console.error('Error fetching context:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const highlightKeyword = (text, keyword) => {
    if (!keyword || !text) return text;

    const regex = new RegExp(`(\\b${keyword}\\b)`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (regex.test(part)) {
        return (
          <mark key={i} className="bg-yellow-200 px-1 rounded font-semibold">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      ticker: ticker,
      keyword: keyword
    });
    return `${baseUrl}/?${params.toString()}`;
  };

  const shareContext = async () => {
    const shareUrl = generateShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  if (!isOpen) return null;

  const displayedExcerpts = showAll
    ? contextData?.excerpts
    : contextData?.excerpts?.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold">
                Context: "{keyword}"
              </h2>
              <p className="text-blue-100 text-sm sm:text-base mt-1">
                {contextData ? `${ticker} - ${contextData.quarter}` : ticker}
              </p>
              <p className="text-blue-200 text-xs mt-2 opacity-75">
                💡 Use arrow keys to navigate • ESC to close
              </p>
            </div>
            <div className="flex items-start gap-2">
              {contextData && (
                <button
                  onClick={shareContext}
                  className="text-white hover:text-blue-200 text-sm px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
                  title="Share this context"
                >
                  🔗 Share
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading context...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Unable to fetch context</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {contextData && !loading && !error && (
            <>
              {/* Excerpts Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📄</span>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Transcript Excerpts
                    <span className="text-blue-600 ml-2">
                      ({contextData.totalMentions} mention{contextData.totalMentions !== 1 ? 's' : ''})
                    </span>
                  </h3>
                </div>

                {contextData.excerpts.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-600">
                    No mentions found in the most recent transcript
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedExcerpts.map((excerpt, index) => {
                      const isFocused = index === currentExcerptIndex;
                      return (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 transition-all ${
                            isFocused
                              ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-300'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          id={`excerpt-${index}`}
                          onClick={() => setCurrentExcerptIndex(index)}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`flex-shrink-0 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold ${
                              isFocused
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-400 text-white'
                            }`}>
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-700 leading-relaxed">
                                {highlightKeyword(excerpt, keyword)}
                              </p>
                              <div className="mt-3 flex justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(excerpt, index);
                                  }}
                                  className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                                  title="Copy excerpt"
                                >
                                  {copiedIndex === index ? (
                                    <>
                                      <span>✓</span>
                                      <span className="text-green-600 font-semibold">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>📋</span>
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show All Button */}
                {contextData.excerpts.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {showAll
                        ? 'Show Less'
                        : `Show all ${contextData.totalMentions} mentions`}
                    </button>
                  </div>
                )}
              </div>

              {/* TODO: Add AI summary section here tomorrow */}
              {/* Will call POST /api/generate-summary */}
              {/* Display above excerpts */}

              {/* Full Transcript Link */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <a
                  href={contextData.transcriptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read Full Transcript →
                </a>
              </div>

              {/* Note */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Context from most recent quarter ({contextData.quarter}).
                  AI summary coming soon!
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default KeywordContextModal;
