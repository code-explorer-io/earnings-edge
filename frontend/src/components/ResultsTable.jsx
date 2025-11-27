import { useState } from 'react';
import './ResultsTable.css';
import KeywordContextModal from './KeywordContextModal';
import PolyMarketButton from './PolyMarketButton';

function ResultsTable({ data, focusedWords, showHighConsistency, ticker }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  if (!data || data.length === 0) return null;

  // Filter data if words are focused (multi-select)
  let displayData = focusedWords && focusedWords.length > 0
    ? data.filter(wordData => focusedWords.includes(wordData.word))
    : data;

  // Filter for high consistency (75%+) if enabled
  if (showHighConsistency) {
    displayData = displayData.filter(wordData => parseFloat(wordData.consistencyPercent) >= 75);
  }

  // Sort by Consistency (descending), then by Total mentions (descending) as tiebreaker
  displayData = [...displayData].sort((a, b) => {
    const consistencyA = parseFloat(a.consistencyPercent);
    const consistencyB = parseFloat(b.consistencyPercent);

    if (consistencyB !== consistencyA) {
      return consistencyB - consistencyA; // Higher consistency first
    }

    return b.total - a.total; // Higher total mentions as tiebreaker
  });

  const quarters = data[0].quarters;

  const getTrafficLightEmoji = (trafficLight) => {
    switch (trafficLight) {
      case 'GREEN':
        return '🟢';
      case 'AMBER':
        return '🟡';
      case 'RED':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const handleGetContext = (keyword) => {
    setSelectedKeyword(keyword);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedKeyword(null);
  };

  const isSingleQuarter = quarters.length === 1;

  return (
    <div className="results-table-container">
      <h3>📋 {isSingleQuarter ? 'Earnings Call Analysis' : 'Enhanced Quarterly Breakdown'}</h3>
      <p className="table-subtitle">
        {isSingleQuarter
          ? `Mention counts from ${quarters[0].quarter} earnings call`
          : 'Raw mention counts per quarter'
        }
      </p>
      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th className="word-column">Word</th>
              {!isSingleQuarter && <th className="traffic-light-column" title="Traffic Light Risk Assessment">🚦</th>}
              {quarters.map((quarter, idx) => (
                <th key={idx} className="quarter-column">{isSingleQuarter ? 'Mentions' : quarter.quarter}</th>
              ))}
              {!isSingleQuarter && <th className="total-column">Total</th>}
              {!isSingleQuarter && <th className="consistency-column" title="Percentage of quarters mentioned">Consistency</th>}
              {!isSingleQuarter && <th className="quarters-mentioned-column" title="Number of quarters with mentions">Qtrs Mentioned</th>}
            </tr>
          </thead>
          <tbody>
            {displayData.map((wordData, idx) => {
              const isHighConsistency = parseFloat(wordData.consistencyPercent) >= 75;
              return (
              <tr
                key={idx}
                className={isHighConsistency ? 'high-consistency-row' : ''}
                style={{
                  backgroundColor: isHighConsistency ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                }}
              >
                <td className="word-cell">
                  <div className="word-cell-content">
                    <span>{wordData.word}</span>
                    {isHighConsistency && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>🟢</span>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetContext(wordData.word);
                      }}
                      className="context-icon-button"
                      title="Get Context from Transcript"
                      aria-label={`Get context for ${wordData.word}`}
                    >
                      💬
                    </button>
                    <PolyMarketButton
                      ticker={ticker}
                      keyword={wordData.word}
                      variant="search"
                      buttonText="🎯"
                      size="small"
                      className="inline-polymarket-btn"
                    />
                  </div>
                </td>
                {!isSingleQuarter && (
                  <td className="traffic-light-cell" title={`${wordData.riskLevel}: ${wordData.consistencyPercent}%`}>
                    <span style={{ fontSize: '2.25rem' }}>{getTrafficLightEmoji(wordData.trafficLight)}</span>
                  </td>
                )}
                {wordData.quarters.map((quarter, qIdx) => (
                  <td
                    key={qIdx}
                    className="count-cell"
                    style={{
                      backgroundColor: quarter.count > 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      fontWeight: quarter.count > 0 ? 'bold' : 'normal'
                    }}
                  >
                    {quarter.count}
                  </td>
                ))}
                {!isSingleQuarter && <td className="total-cell">{wordData.total}</td>}
                {!isSingleQuarter && (
                  <td className="consistency-cell">
                    <strong>{wordData.consistencyPercent}%</strong>
                  </td>
                )}
                {!isSingleQuarter && (
                  <td className="quarters-mentioned-cell">
                    {wordData.quartersMentioned}/{wordData.totalQuarters}
                  </td>
                )}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Keyword Context Modal */}
      <KeywordContextModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        ticker={ticker}
        keyword={selectedKeyword}
      />
    </div>
  );
}

export default ResultsTable;
