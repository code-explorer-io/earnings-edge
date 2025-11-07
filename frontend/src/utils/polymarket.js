/**
 * PolyMarket Affiliate Integration Utilities
 *
 * These functions construct affiliate links to PolyMarket based on analysis results.
 * Links only work when VITE_POLYMARKET_REF environment variable is set.
 */

/**
 * Get PolyMarket affiliate link
 *
 * @param {string} type - Link type: 'search' or 'generic'
 * @param {string} ticker - Stock ticker symbol (e.g., 'AAPL')
 * @param {string} keyword - Keyword to search for (optional, used with 'search' type)
 * @returns {string|null} - Complete PolyMarket URL with affiliate code, or null if ref code not set
 */
export function getPolyMarketLink(type = 'generic', ticker = '', keyword = '') {
  // Check if affiliate reference code is configured
  const refCode = import.meta.env.VITE_POLYMARKET_REF;

  if (!refCode) {
    return null; // No ref code = no affiliate links shown
  }

  // Base PolyMarket URL
  const baseUrl = 'https://polymarket.com';

  if (type === 'search' && (ticker || keyword)) {
    // Construct search query
    const searchTerms = [];

    if (ticker) {
      searchTerms.push(ticker);
      searchTerms.push('CEO'); // Add CEO to make searches more relevant to earnings calls
    }

    if (keyword) {
      searchTerms.push(keyword);
    }

    const query = searchTerms.join('+');
    const encodedQuery = encodeURIComponent(searchTerms.join(' '));

    return `${baseUrl}/search?q=${encodedQuery}&ref=${encodeURIComponent(refCode)}`;
  }

  // Generic PolyMarket homepage with ref code
  return `${baseUrl}?ref=${encodeURIComponent(refCode)}`;
}

/**
 * Check if PolyMarket affiliate is enabled
 *
 * @returns {boolean} - True if VITE_POLYMARKET_REF is configured
 */
export function isPolyMarketEnabled() {
  return !!import.meta.env.VITE_POLYMARKET_REF;
}

/**
 * Get affiliate status message for console logging
 *
 * @returns {string} - Status message for developers
 */
export function getAffiliateStatus() {
  if (isPolyMarketEnabled()) {
    return '✅ PolyMarket affiliate active';
  }
  return '⏳ Add VITE_POLYMARKET_REF to enable affiliate links';
}
