import * as cheerio from 'cheerio';

// Cache for storing scraped data (5 minute expiry)
const cache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('polymarket.com')) {
    return res.status(400).json({ message: 'Please enter a valid PolyMarket URL' });
  }

  // Check cache first
  const cacheKey = url.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    console.log('✓ Returning cached PolyMarket data');
    return res.status(200).json(cached.data);
  }

  try {
    console.log('📥 Fetching PolyMarket page:', url);

    // Fetch the PolyMarket page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch PolyMarket page');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract market title
    const title = $('h1').first().text().trim() || $('title').text().trim();
    console.log('📊 Market title:', title);

    if (!title) {
      throw new Error('Could not find market title on page');
    }

    // Parse the title to extract company and words (pass URL for fallback parsing)
    const parsedData = parseMarketTitle(title, url);

    // Try to extract prices from the page
    let yesPrice = undefined;
    let noPrice = undefined;

    // Look for price elements (PolyMarket typically shows prices in specific classes)
    // This is a best-effort extraction - structure may change
    const priceText = $('[class*="price"], [class*="Price"]').text();
    const priceMatch = priceText.match(/(\d+)¢/g);
    if (priceMatch && priceMatch.length >= 2) {
      yesPrice = parseInt(priceMatch[0]);
      noPrice = parseInt(priceMatch[1]);
    }

    // Try to extract volume and traders (optional)
    const statsText = $('[class*="stat"], [class*="Stats"]').text();
    const volumeMatch = statsText.match(/\$?([\d,]+)/);
    const volume = volumeMatch ? parseInt(volumeMatch[1].replace(/,/g, '')) : undefined;

    const result = {
      company: parsedData.company,
      ticker: parsedData.ticker,
      words: parsedData.words,
      yesPrice,
      noPrice,
      volume,
      quarter: parsedData.quarter,
      marketUrl: url,
      title
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    console.log('✓ Successfully scraped PolyMarket data:', result);
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error scraping PolyMarket:', error);
    return res.status(500).json({
      message: 'Unable to fetch data from PolyMarket. Try manual entry below.',
      error: error.message
    });
  }
}

// Parse market title to extract company, ticker, words, and quarter
function parseMarketTitle(title, url = '') {
  const titleLower = title.toLowerCase();
  const urlLower = url.toLowerCase();

  // Common company name to ticker mappings (expanded list)
  const companyMap = {
    'starbucks': { name: 'Starbucks', ticker: 'SBUX' },
    'sbux': { name: 'Starbucks', ticker: 'SBUX' },
    'apple': { name: 'Apple', ticker: 'AAPL' },
    'aapl': { name: 'Apple', ticker: 'AAPL' },
    'microsoft': { name: 'Microsoft', ticker: 'MSFT' },
    'msft': { name: 'Microsoft', ticker: 'MSFT' },
    'amazon': { name: 'Amazon', ticker: 'AMZN' },
    'amzn': { name: 'Amazon', ticker: 'AMZN' },
    'google': { name: 'Google', ticker: 'GOOGL' },
    'googl': { name: 'Google', ticker: 'GOOGL' },
    'alphabet': { name: 'Google', ticker: 'GOOGL' },
    'tesla': { name: 'Tesla', ticker: 'TSLA' },
    'tsla': { name: 'Tesla', ticker: 'TSLA' },
    'meta': { name: 'Meta', ticker: 'META' },
    'facebook': { name: 'Meta', ticker: 'META' },
    'nvidia': { name: 'NVIDIA', ticker: 'NVDA' },
    'nvda': { name: 'NVIDIA', ticker: 'NVDA' },
    'netflix': { name: 'Netflix', ticker: 'NFLX' },
    'nflx': { name: 'Netflix', ticker: 'NFLX' },
    'walmart': { name: 'Walmart', ticker: 'WMT' },
    'wmt': { name: 'Walmart', ticker: 'WMT' },
    'target': { name: 'Target', ticker: 'TGT' },
    'tgt': { name: 'Target', ticker: 'TGT' },
    'costco': { name: 'Costco', ticker: 'COST' },
    'cost': { name: 'Costco', ticker: 'COST' },
    'uber': { name: 'Uber', ticker: 'UBER' },
    'lyft': { name: 'Lyft', ticker: 'LYFT' },
    'airbnb': { name: 'Airbnb', ticker: 'ABNB' },
    'abnb': { name: 'Airbnb', ticker: 'ABNB' },
    'doordash': { name: 'DoorDash', ticker: 'DASH' },
    'dash': { name: 'DoorDash', ticker: 'DASH' },
    'shopify': { name: 'Shopify', ticker: 'SHOP' },
    'shop': { name: 'Shopify', ticker: 'SHOP' },
    'coinbase': { name: 'Coinbase', ticker: 'COIN' },
    'coin': { name: 'Coinbase', ticker: 'COIN' },
    'palantir': { name: 'Palantir', ticker: 'PLTR' },
    'pltr': { name: 'Palantir', ticker: 'PLTR' },
    'spotify': { name: 'Spotify', ticker: 'SPOT' },
    'spot': { name: 'Spotify', ticker: 'SPOT' },
    'disney': { name: 'Disney', ticker: 'DIS' },
    'dis': { name: 'Disney', ticker: 'DIS' },
    'mcdonalds': { name: 'McDonalds', ticker: 'MCD' },
    'mcd': { name: 'McDonalds', ticker: 'MCD' },
    'chipotle': { name: 'Chipotle', ticker: 'CMG' },
    'cmg': { name: 'Chipotle', ticker: 'CMG' },
    'nike': { name: 'Nike', ticker: 'NKE' },
    'nke': { name: 'Nike', ticker: 'NKE' },
    'amd': { name: 'AMD', ticker: 'AMD' },
    'intel': { name: 'Intel', ticker: 'INTC' },
    'intc': { name: 'Intel', ticker: 'INTC' },
  };

  // Try to find company name from title first
  let company = null;
  let ticker = null;

  for (const [key, value] of Object.entries(companyMap)) {
    if (titleLower.includes(key)) {
      company = value.name;
      ticker = value.ticker;
      break;
    }
  }

  // If not found in title, try URL slug
  if (!company && url) {
    // Extract slug from URL (e.g., "earnings-mentions-uber-2025-10-30")
    const urlParts = url.split('/');
    const slug = urlParts[urlParts.length - 1]?.split('?')[0] || '';
    const slugLower = slug.toLowerCase();

    for (const [key, value] of Object.entries(companyMap)) {
      if (slugLower.includes(key)) {
        company = value.name;
        ticker = value.ticker;
        console.log(`✓ Found company from URL slug: ${company} (${ticker})`);
        break;
      }
    }
  }

  // Extract quarter (e.g., "Q4 2024", "Q1 2025")
  const quarterMatch = title.match(/Q([1-4])\s*(\d{4})/i);
  const quarter = quarterMatch ? `Q${quarterMatch[1]} ${quarterMatch[2]}` : null;

  // Extract words being tracked
  const words = [];

  // Look for words in quotes
  const quotedWords = title.match(/["']([^"']+)["']/g);
  if (quotedWords) {
    quotedWords.forEach(quoted => {
      const word = quoted.replace(/["']/g, '').trim();
      if (word && !words.includes(word)) {
        words.push(word);
      }
    });
  }

  // Look for "mention [word]" pattern (more flexible)
  const mentionPatterns = [
    /mention[s]?\s+["']?([a-zA-Z\s]+?)["']?[\s\?]/i,
    /will\s+.*?\s+say\s+["']?([a-zA-Z\s]+?)["']?[\s\?]/i,
    /will\s+.*?\s+mention\s+["']?([a-zA-Z\s]+?)["']?[\s\?]/i,
  ];

  for (const pattern of mentionPatterns) {
    const match = title.match(pattern);
    if (match && match[1] && !words.includes(match[1])) {
      const extractedWord = match[1].trim();
      // Filter out company names and common filler words
      if (extractedWord.length > 2 &&
          !extractedWord.toLowerCase().includes('earning') &&
          extractedWord.toLowerCase() !== company?.toLowerCase()) {
        words.push(extractedWord);
      }
    }
  }

  // Look for common earnings keywords
  const commonWords = [
    'holiday', 'protein', 'ai', 'artificial intelligence', 'canada', 'china',
    'india', 'europe', 'crypto', 'blockchain', 'revenue', 'profit', 'growth',
    'olympus', 'autonomous', 'robotaxi', 'fsd', 'margins', 'guidance', 'tariff',
    'inflation', 'interest', 'competition', 'subscription', 'advertising',
    'cloud', 'aws', 'azure',
    // Uber-specific
    'delivery', 'waymo', 'lucid', 'safety', 'joby', 'expansion', 'innovation',
    'regulation', 'regulator', 'taylor swift', 'uber copter', 'uber explore',
    'lyft', 'freight', 'market share', 'driver incentives', 'driver', 'incentives',
    // Tesla-specific
    'cybertruck', 'model', 'gigafactory', 'supercharger', 'optimus',
    // Tech general
    'metaverse', 'vr', 'ar', 'machine learning', 'data center', 'semiconductor'
  ];

  // Filter common stop words that shouldn't be extracted
  const stopWords = ['during', 'will', 'the', 'and', 'or', 'but', 'with', 'from', 'their', 'this', 'that', 'what', 'when', 'where', 'who', 'how'];

  for (const word of commonWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(title) && !words.some(w => w.toLowerCase() === word.toLowerCase())) {
      // Skip stop words
      if (!stopWords.includes(word.toLowerCase())) {
        words.push(word.charAt(0).toUpperCase() + word.slice(1));
      }
    }
  }

  // Remove stop words from extracted words
  const filteredWords = words.filter(w => !stopWords.includes(w.toLowerCase()));

  // Also check URL for word hints
  if (url && filteredWords.length === 0) {
    const urlParts = url.split('/');
    const slug = urlParts[urlParts.length - 1]?.split('?')[0] || '';

    // Look for patterns like "word-mention" or "mention-word"
    for (const word of commonWords) {
      if (slug.toLowerCase().includes(word) && !stopWords.includes(word.toLowerCase())) {
        const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
        if (!filteredWords.includes(capitalizedWord)) {
          filteredWords.push(capitalizedWord);
          console.log(`✓ Found word from URL: ${capitalizedWord}`);
        }
      }
    }
  }

  // If no company found, try to extract from beginning of title
  if (!company) {
    const firstWord = title.split(/\s+/)[0];
    const potentialTicker = firstWord.toUpperCase();
    if (potentialTicker.match(/^[A-Z]{2,5}$/)) {
      ticker = potentialTicker;
      company = potentialTicker;
    }
  }

  return {
    company: company || 'Unknown',
    ticker: ticker || 'UNKNOWN',
    words: filteredWords.length > 0 ? filteredWords : ['Unknown'],
    quarter
  };
}
