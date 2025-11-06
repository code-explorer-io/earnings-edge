// Using native fetch instead of axios to avoid header encoding issues
import { applySecurityMiddleware, validateEnvironment } from '../_security.js';

// In-memory cache for transcripts with TTL (Time To Live)
const transcriptCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes - allows frequent updates for testing while reducing API calls

// Helper functions for cache with TTL
function setCacheWithTTL(key, value) {
  transcriptCache.set(key, {
    data: value,
    expiry: Date.now() + CACHE_TTL,
    cachedAt: new Date().toISOString()
  });
}

function getCacheIfValid(key) {
  const cached = transcriptCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  transcriptCache.delete(key);
  return null;
}

// Helper function to fetch last 8 quarters from API Ninjas
async function fetchLast8Quarters(ticker, apiKey) {
  const transcripts = [];

  // Calculate current quarter - START FROM CURRENT to get same-day transcripts
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  const currentQuarter = Math.floor(currentMonth / 3) + 1; // 1-4

  // START FROM CURRENT QUARTER (not 2 quarters back)
  // This allows same-day transcript detection for critical trading insights
  let year = currentYear;
  let quarter = currentQuarter;

  console.log(`📅 Starting from CURRENT quarter: Q${quarter} ${year} (Today: ${today.toISOString()})`);

  // Generate list of quarters to fetch (last 8 quarters)
  const quartersToFetch = [];

  for (let i = 0; i < 8; i++) {
    quartersToFetch.push({ year, quarter });
    quarter--;
    if (quarter === 0) {
      quarter = 4;
      year--;
    }
  }

  // Fetch each quarter (in parallel for speed)
  const promises = quartersToFetch.map(async ({ year, quarter }) => {
    try {
      const url = `https://api.api-ninjas.com/v1/earningstranscript?ticker=${ticker}&year=${year}&quarter=${quarter}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey
        }
      });

      if (!response.ok) {
        console.error(`⚠️  API returned ${response.status} for Q${quarter} ${year}`);
        return null;
      }

      const data = await response.json();

      // API Ninjas returns the transcript data directly
      if (data && data.transcript) {
        return {
          ticker: ticker,
          quarter: `Q${quarter} ${year}`,
          year: year,
          quarterNum: quarter,
          date: data.date || `${quarter * 3}/15/${year}`,
          transcript: data.transcript
        };
      }
      return null;
    } catch (err) {
      console.error(`⚠️  Could not fetch Q${quarter} ${year}:`, {
        message: err.message,
        stack: err.stack
      });
      return null;
    }
  });

  const results = await Promise.all(promises);

  // Filter out null results and sort by date (most recent first)
  return results
    .filter(t => t !== null)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.quarterNum - a.quarterNum;
    });
}

export default async function handler(req, res) {
  console.log('🚀 Transcripts API called:', req.query);

  // Apply security middleware (CORS, headers, rate limiting)
  const securityCheck = applySecurityMiddleware(req, res);
  if (securityCheck.blocked) {
    return; // Response already sent by middleware
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate environment variables
  const envCheck = validateEnvironment();
  if (!envCheck.valid) {
    console.error('❌ API key not configured');
    return res.status(500).json({
      error: 'Configuration error',
      message: envCheck.error
    });
  }

  try {
    const { ticker } = req.query;
    const cacheKey = ticker.toUpperCase();

    console.log(`📋 Processing ticker: ${cacheKey}`);

    // Check cache first (with TTL validation)
    const cachedData = getCacheIfValid(cacheKey);
    if (cachedData) {
      console.log(`✓ Serving ${cacheKey} from cache (valid for ${Math.round((cachedData.expiry - Date.now()) / 60000)} more minutes)`);
      return res.status(200).json(cachedData.data);
    }

    // API Ninja endpoint for earnings transcripts
    const apiKey = process.env.API_NINJA_KEY;

    console.log(`📡 Fetching transcripts for ${cacheKey} from API Ninjas...`);

    // Fetch last 8 quarters from API Ninjas
    const transcripts = await fetchLast8Quarters(cacheKey, apiKey);

    console.log(`📊 Fetched ${transcripts.length} transcripts`);

    if (transcripts.length === 0) {
      console.error(`❌ No transcripts found for ${cacheKey}`);
      return res.status(404).json({
        error: 'No transcripts found',
        message: `No earnings call transcripts available for ticker ${cacheKey}. Try a major company like SBUX, AAPL, MSFT, or GOOGL.`
      });
    }

    const result = {
      ticker: cacheKey,
      transcripts: transcripts
    };

    // Cache the result with TTL
    setCacheWithTTL(cacheKey, result);
    console.log(`✓ Successfully fetched ${transcripts.length} transcripts for ${cacheKey} (cached for 30 minutes)`);

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error fetching transcripts:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
    }

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || error.message;

    return res.status(statusCode).json({
      error: 'Failed to fetch transcripts',
      message: `API Error: ${errorMessage}. Please check your API key and try again.`,
      details: error.message
    });
  }
}
