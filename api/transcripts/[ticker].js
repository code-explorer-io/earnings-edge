// Using Finnhub API for earnings call transcripts
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

// Helper function to fetch transcript list from Finnhub
async function fetchTranscriptList(ticker, apiKey) {
  const url = `https://finnhub.io/api/v1/stock/transcripts/list?symbol=${ticker}&token=${apiKey}`;

  console.log(`📡 Fetching transcript list for ${ticker} from Finnhub...`);

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`⚠️  Finnhub API returned ${response.status}: ${errorText}`);
    throw new Error(`API returned status ${response.status}`);
  }

  const data = await response.json();
  return data.transcripts || [];
}

// Helper function to fetch a single transcript by ID from Finnhub
async function fetchTranscriptById(transcriptId, apiKey) {
  const url = `https://finnhub.io/api/v1/stock/transcripts?id=${transcriptId}&token=${apiKey}`;

  console.log(`📡 Fetching transcript ${transcriptId} from Finnhub...`);

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`⚠️  Finnhub API returned ${response.status}: ${errorText}`);
    return null;
  }

  return await response.json();
}

// Helper function to fetch the latest transcript from Finnhub
async function fetchLatestTranscript(ticker, apiKey) {
  try {
    // Step 1: Get list of available transcripts
    const transcriptList = await fetchTranscriptList(ticker, apiKey);

    if (!transcriptList || transcriptList.length === 0) {
      console.log(`⚠️  No transcripts available for ${ticker}`);
      return { transcripts: [], error: 'No transcripts available for this ticker' };
    }

    console.log(`📊 Found ${transcriptList.length} transcripts for ${ticker}`);

    // Step 2: Get the most recent transcript (first in list)
    const latestTranscriptInfo = transcriptList[0];
    const transcriptData = await fetchTranscriptById(latestTranscriptInfo.id, apiKey);

    if (!transcriptData || !transcriptData.transcript) {
      return { transcripts: [], error: 'Could not fetch transcript content' };
    }

    // Step 3: Convert Finnhub format to our format
    // Finnhub returns transcript as array of speech segments
    const fullTranscript = transcriptData.transcript
      .map(segment => {
        const speaker = segment.name || 'Unknown';
        const speech = segment.speech || '';
        return `${speaker}: ${speech}`;
      })
      .join('\n\n');

    const year = transcriptData.year || latestTranscriptInfo.year || new Date().getFullYear();
    const quarter = transcriptData.quarter || latestTranscriptInfo.quarter || Math.floor(new Date().getMonth() / 3) + 1;

    return {
      transcripts: [{
        ticker: ticker,
        quarter: `Q${quarter} ${year}`,
        year: year,
        quarterNum: quarter,
        date: transcriptData.time || latestTranscriptInfo.time || new Date().toISOString(),
        transcript: fullTranscript,
        title: transcriptData.title || latestTranscriptInfo.title || `${ticker} Q${quarter} ${year} Earnings Call`
      }],
      error: null
    };
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
    // Log detailed error server-side, return generic message to client
    console.error('Environment validation failed:', envCheck.error);
    return res.status(500).json({
      error: 'Configuration error',
      message: 'Server is not properly configured. Please contact support.'
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

    // Finnhub API key
    const apiKey = process.env.API_FINHUB_KEY;

    console.log(`📡 Fetching transcripts for ${cacheKey} from Finnhub...`);

    // Fetch latest transcript from Finnhub
    const { transcripts, error } = await fetchLatestTranscript(cacheKey, apiKey);

    console.log(`📊 Fetched ${transcripts.length} transcripts`);

    if (transcripts.length === 0) {
      console.error(`❌ No transcripts found for ${cacheKey}: ${error}`);

      return res.status(404).json({
        error: 'No transcripts found',
        message: `No earnings call transcripts available for ticker ${cacheKey}. Try a major company like AAPL, MSFT, GOOGL, or AMZN.`
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
      message: `API Error: ${errorMessage}. Please try again later.`,
      details: error.message
    });
  }
}
