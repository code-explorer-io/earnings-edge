import './ResultsTable.css';

function ResultsTable({ data }) {
  if (!data || data.length === 0) return null;

  const quarters = data[0].quarters;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return '↑';
      case 'decreasing':
        return '↓';
      default:
        return '→';
    }
  };

  const getTrendClass = (trend) => {
    switch (trend) {
      case 'increasing':
        return 'trend-up';
      case 'decreasing':
        return 'trend-down';
      default:
        return 'trend-stable';
    }
  };

  return (
    <div className="results-table-container">
      <h3>📋 Quarterly Breakdown</h3>
      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th className="word-column">Word</th>
              {quarters.map((quarter, idx) => (
                <th key={idx} className="quarter-column">{quarter.quarter}</th>
              ))}
              <th className="total-column">Total</th>
              <th className="avg-column">Avg</th>
              <th className="trend-column">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((wordData, idx) => (
              <tr key={idx}>
                <td className="word-cell">{wordData.word}</td>
                {wordData.quarters.map((quarter, qIdx) => (
                  <td key={qIdx} className="count-cell">
                    {quarter.count}
                  </td>
                ))}
                <td className="total-cell">{wordData.total}</td>
                <td className="avg-cell">{wordData.average}</td>
                <td className={`trend-cell ${getTrendClass(wordData.trend)}`}>
                  {getTrendIcon(wordData.trend)} {wordData.trend}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResultsTable;
