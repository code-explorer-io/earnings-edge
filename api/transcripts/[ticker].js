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

// Helper function to fetch the latest transcript from API Ninjas (FREE tier)
// FREE tier only allows fetching the most recent transcript (no year/quarter params)
async function fetchLatestTranscript(ticker, apiKey) {
  try {
    // FREE tier: no year/quarter params - returns only the latest transcript
    const url = `https://api.api-ninjas.com/v1/earningstranscript?ticker=${ticker}`;

    console.log(`📡 Fetching latest transcript for ${ticker} (FREE tier - single quarter only)`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey
      }
    });

    if (!response.ok) {
      console.error(`⚠️  API returned ${response.status} for ${ticker}`);
      return { transcripts: [], error: `API returned status ${response.status}` };
    }

    const data = await response.json();

    // Check for premium-only error
    if (data.error) {
      console.error(`⚠️  API error for ${ticker}: ${data.error}`);
      return { transcripts: [], error: data.error };
    }

    // API Ninjas returns the transcript data directly
    if (data && data.transcript) {
      const year = parseInt(data.year) || new Date().getFullYear();
      const quarter = parseInt(data.quarter) || Math.floor(new Date().getMonth() / 3) + 1;

      return {
        transcripts: [{
          ticker: ticker,
          quarter: `Q${quarter} ${year}`,
          year: year,
          quarterNum: quarter,
          date: data.date || `${quarter * 3}/15/${year}`,
          transcript: data.transcript
        }],
        error: null
      };
    }

    return { transcripts: [], error: 'No transcript data returned' };
  } catch (err) {
    console.error(`⚠️  Could not fetch transcript for ${ticker}:`, {
      message: err.message,
      stack: err.stack
    });
    return { transcripts: [], error: err.message };
  }
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

    console.log(`📡 Fetching transcripts for ${cacheKey} from API Ninjas (FREE tier)...`);

    // Fetch latest transcript from API Ninjas (FREE tier limitation)
    const { transcripts, error } = await fetchLatestTranscript(cacheKey, apiKey);

    console.log(`📊 Fetched ${transcripts.length} transcripts`);

    if (transcripts.length === 0) {
      console.error(`❌ No transcripts found for ${cacheKey}: ${error}`);

      // Check if it's a premium-only ticker
      if (error && error.includes('premium')) {
        return res.status(403).json({
          error: 'Premium ticker',
          message: `${cacheKey} transcripts require a premium API Ninjas subscription. Try popular tickers like AAPL, MSFT, GOOGL, AMZN, SBUX, or COST.`,
          isPremium: true
        });
      }

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
