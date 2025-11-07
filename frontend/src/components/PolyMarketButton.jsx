import { getPolyMarketLink } from '../utils/polymarket';
import './PolyMarketButton.css';

/**
 * PolyMarket Affiliate Button Component
 *
 * Only renders when VITE_POLYMARKET_REF is configured.
 * Provides clear path from analysis to trading on PolyMarket.
 *
 * @param {Object} props
 * @param {string} props.ticker - Stock ticker (e.g., 'AAPL')
 * @param {string} props.keyword - Keyword to search for (optional)
 * @param {string} props.buttonText - Text to display on button
 * @param {string} props.variant - 'search' or 'generic'
 * @param {string} props.size - 'small', 'medium', or 'large' (default: 'medium')
 * @param {string} props.className - Additional CSS classes
 */
function PolyMarketButton({
  ticker = '',
  keyword = '',
  buttonText = 'View on PolyMarket',
  variant = 'generic',
  size = 'medium',
  className = ''
}) {
  // Get the PolyMarket link with affiliate code
  const polymarketUrl = getPolyMarketLink(variant, ticker, keyword);

  // Don't render anything if affiliate code not configured
  if (!polymarketUrl) {
    return null;
  }

  return (
    <a
      href={polymarketUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`polymarket-button polymarket-button-${size} ${className}`}
      aria-label={`${buttonText} - Opens in new tab`}
    >
      <span className="polymarket-button-icon">📊</span>
      <span className="polymarket-button-text">{buttonText}</span>
      <span className="polymarket-button-arrow">→</span>
    </a>
  );
}

export default PolyMarketButton;
