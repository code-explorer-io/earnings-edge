import './ResultsTable.css';

function ResultsTable({ data, focusedWords, showHighConsistency }) {
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

  return (
    <div className="results-table-container">
      <h3>📋 Enhanced Quarterly Breakdown</h3>
      <p className="table-subtitle">Raw mention counts per quarter</p>
      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th className="word-column">Word</th>
              <th className="traffic-light-column" title="Traffic Light Risk Assessment">🚦</th>
              {quarters.map((quarter, idx) => (
                <th key={idx} className="quarter-column">{quarter.quarter}</th>
              ))}
              <th className="total-column">Total</th>
              <th className="consistency-column" title="Percentage of quarters mentioned">Consistency</th>
              <th className="quarters-mentioned-column" title="Number of quarters with mentions">Qtrs Mentioned</th>
              <th className="bond-rating-column" title="Bond rating based on consistency">Bond Rating</th>
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
                  {wordData.word}
                  {isHighConsistency && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>🟢</span>}
                </td>
                <td className="traffic-light-cell" title={`${wordData.riskLevel}: ${wordData.consistencyPercent}%`}>
                  <span style={{ fontSize: '2.25rem' }}>{getTrafficLightEmoji(wordData.trafficLight)}</span>
                </td>
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
                <td className="total-cell">{wordData.total}</td>
                <td className="consistency-cell">
                  <strong>{wordData.consistencyPercent}%</strong>
                </td>
                <td className="quarters-mentioned-cell">
                  {wordData.quartersMentioned}/{wordData.totalQuarters}
                </td>
                <td className="bond-rating-cell">
                  <strong>{wordData.bondRating}</strong>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResultsTable;
