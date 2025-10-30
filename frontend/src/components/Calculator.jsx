import { useState } from 'react';
import './Calculator.css';

function Calculator() {
  const [positions, setPositions] = useState([
    { id: 1, buyPrice: 96, shares: 100 }
  ]);

  const updatePosition = (id, field, value) => {
    setPositions(positions.map(pos =>
      pos.id === id ? { ...pos, [field]: parseFloat(value) || 0 } : pos
    ));
  };

  const addPosition = () => {
    if (positions.length < 3) {
      const newId = Math.max(...positions.map(p => p.id)) + 1;
      setPositions([...positions, { id: newId, buyPrice: 96, shares: 100 }]);
    }
  };

  const removePosition = (id) => {
    if (positions.length > 1) {
      setPositions(positions.filter(pos => pos.id !== id));
    }
  };

  const calculateMetrics = (buyPrice, shares) => {
    const totalCost = (buyPrice / 100) * shares;
    const yesPayout = shares * 1.00;
    const yesProfit = yesPayout - totalCost;
    const yesROI = (yesProfit / totalCost) * 100;
    const noLoss = -totalCost;
    const impliedYield = ((100 - buyPrice) / buyPrice) * 100;
    const breakeven = buyPrice;

    return {
      totalCost,
      yesPayout,
      yesProfit,
      yesROI,
      noLoss,
      impliedYield,
      breakeven
    };
  };

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h2>PolyMarket Profit Calculator</h2>
        <p className="calculator-subtitle">
          Calculate potential profits and losses for your prediction market positions
        </p>
      </div>

      <div className="positions-grid">
        {positions.map((position, index) => {
          const metrics = calculateMetrics(position.buyPrice, position.shares);

          return (
            <div key={position.id} className="calculator-card">
              <div className="card-header">
                <h3>Position {index + 1}</h3>
                {positions.length > 1 && (
                  <button
                    className="remove-btn"
                    onClick={() => removePosition(position.id)}
                    title="Remove position"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="input-section">
                <div className="input-group">
                  <label htmlFor={`buy-price-${position.id}`}>
                    Buy Price (¢)
                  </label>
                  <input
                    type="number"
                    id={`buy-price-${position.id}`}
                    value={position.buyPrice}
                    onChange={(e) => updatePosition(position.id, 'buyPrice', e.target.value)}
                    min="1"
                    max="99"
                    step="1"
                  />
                  <span className="input-hint">Price per share in cents</span>
                </div>

                <div className="input-group">
                  <label htmlFor={`shares-${position.id}`}>
                    Number of Shares
                  </label>
                  <input
                    type="number"
                    id={`shares-${position.id}`}
                    value={position.shares}
                    onChange={(e) => updatePosition(position.id, 'shares', e.target.value)}
                    min="1"
                    step="1"
                  />
                  <span className="input-hint">Total shares to purchase</span>
                </div>
              </div>

              <div className="metrics-section">
                <div className="metric-row investment">
                  <span className="metric-label">Total Investment:</span>
                  <span className="metric-value">${metrics.totalCost.toFixed(2)}</span>
                </div>

                <div className="metric-row breakeven">
                  <span className="metric-label">Breakeven Price:</span>
                  <span className="metric-value">{metrics.breakeven}¢</span>
                </div>

                <div className="metric-row yield">
                  <span className="metric-label">Implied Yield:</span>
                  <span className="metric-value highlight">
                    {metrics.impliedYield.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="scenarios-section">
                <div className="scenario yes-scenario">
                  <div className="scenario-header">
                    <span className="scenario-icon">✅</span>
                    <h4>IF YES (Word Mentioned)</h4>
                  </div>
                  <div className="scenario-content">
                    <div className="scenario-row">
                      <span>Payout:</span>
                      <span className="value">${metrics.yesPayout.toFixed(2)}</span>
                    </div>
                    <div className="scenario-row">
                      <span>Profit:</span>
                      <span className="value profit">+${metrics.yesProfit.toFixed(2)}</span>
                    </div>
                    <div className="scenario-row total">
                      <span>ROI:</span>
                      <span className="value roi-positive">+{metrics.yesROI.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="scenario no-scenario">
                  <div className="scenario-header">
                    <span className="scenario-icon">❌</span>
                    <h4>IF NO (Word Not Mentioned)</h4>
                  </div>
                  <div className="scenario-content">
                    <div className="scenario-row">
                      <span>Payout:</span>
                      <span className="value">$0.00</span>
                    </div>
                    <div className="scenario-row">
                      <span>Loss:</span>
                      <span className="value loss">${metrics.noLoss.toFixed(2)}</span>
                    </div>
                    <div className="scenario-row total">
                      <span>ROI:</span>
                      <span className="value roi-negative">-100.00%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {positions.length < 3 && (
        <button className="add-position-btn" onClick={addPosition}>
          + Add Position to Compare
        </button>
      )}

      <div className="calculator-footer">
        <div className="info-box">
          <h4>💡 How to Use</h4>
          <ul>
            <li><strong>Buy Price:</strong> Enter the price in cents (1-99¢) at which you're buying shares</li>
            <li><strong>Shares:</strong> Enter how many shares you want to purchase</li>
            <li><strong>Compare:</strong> Add up to 3 positions side-by-side to compare different strategies</li>
            <li><strong>Implied Yield:</strong> Shows your potential return if the outcome is YES</li>
          </ul>
        </div>

        <div className="info-box">
          <h4>📊 Understanding the Results</h4>
          <ul>
            <li><strong>Total Investment:</strong> Your upfront cost (Buy Price × Shares / 100)</li>
            <li><strong>YES Scenario:</strong> You receive $1.00 per share if the word is mentioned</li>
            <li><strong>NO Scenario:</strong> You receive $0.00 and lose your entire investment</li>
            <li><strong>ROI:</strong> Return on Investment as a percentage of your initial cost</li>
          </ul>
        </div>

        <div className="info-box example">
          <h4>📝 Example</h4>
          <p>
            Buying 100 shares at 96¢ costs $96.00. If the word IS mentioned, you receive $100.00
            (100 shares × $1.00), giving you a profit of $4.00 and a 4.17% ROI. If the word is
            NOT mentioned, you lose your $96.00 investment.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Calculator;
