import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables
if (!process.env.API_FINHUB_KEY || process.env.API_FINHUB_KEY === 'your_api_key_here') {
  console.error('❌ ERROR: API_FINHUB_KEY not found in environment variables');
  console.error('Please create a .env file with API_FINHUB_KEY=your_key_here');
  process.exit(1);
}
console.log('✅ Finnhub API key loaded successfully');

// Initialize OpenAI (optional - only if API key is provided)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log('✅ OpenAI API key loaded successfully');
} else {
  console.log('⚠️  OpenAI API key not found - AI summaries will be disabled');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Setup cache directory for AI summaries
const CACHE_DIR = path.join(__dirname, 'cache');
const SUMMARIES_CACHE_FILE = path.join(CACHE_DIR, 'summaries.json');

// Create cache directory if it doesn't exist
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  console.log('✅ Created cache directory');
}

// Initialize summaries cache file if it doesn't exist
if (!fs.existsSync(SUMMARIES_CACHE_FILE)) {
  fs.writeFileSync(SUMMARIES_CACHE_FILE, JSON.stringify({}), 'utf8');
  console.log('✅ Created summaries cache file');
}

// CORS whitelist - only allow trusted origins
const allowedOrigins = [
  // Local development servers
  'http://localhost:5173',      // Vite dev server (primary)
  'http://localhost:5174',      // Vite dev server (alternate port)
  'http://localhost:5175',      // Vite dev server (alternate port 2)
  'http://localhost:3000',      // Alternative dev port
  'http://127.0.0.1:5173',      // Localhost IP variant
  'http://127.0.0.1:5174',      // Localhost IP variant

  // Production domains
  'https://earningsedge.io',    // Production domain
  'https://www.earningsedge.io' // Production domain with www
];

// CORS configuration with STRICT origin validation
const corsOptions = {
  origin: function (origin, callback) {
    // SECURITY: Reject requests with no origin header
    // This prevents attackers from bypassing CORS by omitting the Origin header
    if (!origin) {
      console.log('❌ Blocked request: no origin header');
      return callback(new Error('Origin header required'), false);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increase limit for large transcripts
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase limit for URL-encoded data

// Rate limiting configuration
// Limit: 100 requests per 15 minutes per IP address
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the 100 requests in 15 minutes limit. Please wait before making more requests.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the 100 requests in 15 minutes limit. Please wait before making more requests.',
      retryAfter: '15 minutes'
    });
  }
});

// Apply rate limiting to all /api/* routes
app.use('/api/', apiLimiter);

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
  console.log(`💾 Cached ${key} (expires in 30 minutes at ${new Date(Date.now() + CACHE_TTL).toLocaleString()})`);
}

function getCacheIfValid(key) {
  const cached = transcriptCache.get(key);
  if (cached) {
    if (cached.expiry > Date.now()) {
      const minutesLeft = Math.round((cached.expiry - Date.now()) / (1000 * 60));
      console.log(`✓ Cache HIT for ${key} (cached ${cached.cachedAt}, expires in ${minutesLeft}m)`);
      return cached.data;
    } else {
      console.log(`⏰ Cache EXPIRED for ${key} (was cached ${cached.cachedAt})`);
      transcriptCache.delete(key);
    }
  }
  console.log(`❌ Cache MISS for ${key}`);
  return null;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get earnings transcripts for a company
app.get('/api/transcripts/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const cacheKey = ticker.toUpperCase();

    // Check cache first (with TTL validation)
    const cachedResult = getCacheIfValid(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    // Finnhub API key
    const apiKey = process.env.API_FINHUB_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      console.error('❌ API key not configured');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Server is not properly configured. Please contact support.'
      });
    }

    // Fetch latest transcript from Finnhub
    const { transcripts, error } = await fetchLatestTranscript(cacheKey, apiKey);

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
    console.log(`✓ Successfully fetched ${transcripts.length} transcripts for ${cacheKey}`);
    res.json(result);

  } catch (error) {
    console.error('❌ Error fetching transcripts:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
    }

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || error.message;

    res.status(statusCode).json({
      error: 'Failed to fetch transcripts',
      message: `API Error: ${errorMessage}. Please try again later.`,
      details: error.message
    });
  }
});

// Helper function to fetch transcript list from Finnhub
async function fetchTranscriptList(ticker, apiKey) {
  const url = `https://finnhub.io/api/v1/stock/transcripts/list?symbol=${ticker}&token=${apiKey}`;

  console.log(`📡 Fetching transcript list for ${ticker} from Finnhub...`);

  const response = await axios.get(url, { timeout: 10000 });

  if (response.status !== 200) {
    throw new Error(`API returned status ${response.status}`);
  }

  return response.data.transcripts || [];
}

// Helper function to fetch a single transcript by ID from Finnhub
async function fetchTranscriptById(transcriptId, apiKey) {
  const url = `https://finnhub.io/api/v1/stock/transcripts?id=${transcriptId}&token=${apiKey}`;

  console.log(`📡 Fetching transcript ${transcriptId} from Finnhub...`);

  const response = await axios.get(url, { timeout: 10000 });

  if (response.status !== 200) {
    return null;
  }

  return response.data;
}

// Helper function to fetch the latest transcript from Finnhub
async function fetchLatestTranscript(ticker, apiKey) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📡 Fetching latest transcript for ${ticker} from Finnhub`);
    console.log(`${'='.repeat(60)}`);

    const requestStartTime = Date.now();

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

    const requestDuration = Date.now() - requestStartTime;
    console.log(`📦 Response received (${requestDuration}ms)`);

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

    console.log(`✅ Found transcript: Q${quarter} ${year} (${fullTranscript.length} chars)`);

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
    console.error(`❌ Exception fetching transcript for ${ticker}:`, err.message);
    return { transcripts: [], error: err.message };
  }
}

// Analyze word frequency in transcripts
app.post('/api/analyze', async (req, res) => {
  try {
    const { ticker, words, transcripts } = req.body;

    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: 'Words array is required' });
    }

    if (!transcripts || !Array.isArray(transcripts)) {
      return res.status(400).json({ error: 'Transcripts array is required' });
    }

    const analysis = analyzeWordFrequency(words, transcripts);
    res.json(analysis);

  } catch (error) {
    console.error('Error analyzing transcripts:', error.message);
    res.status(500).json({ error: 'Failed to analyze transcripts', details: error.message });
  }
});

// Helper function to analyze word frequency
function analyzeWordFrequency(words, transcripts) {
  const results = {};

  // Initialize results structure
  words.forEach(word => {
    results[word.toLowerCase()] = {
      word: word,
      quarters: [],
      total: 0,
      average: 0,
      trend: 'stable',
      highest: { quarter: '', count: 0 },
      lowest: { quarter: '', count: Infinity }
    };
  });

  // Process each transcript
  transcripts.forEach((transcript, index) => {
    const quarterLabel = transcript.quarter || `Q${transcripts.length - index}`;
    const text = (transcript.transcript || '').toLowerCase();

    words.forEach(word => {
      const wordLower = word.toLowerCase();

      // Escape special regex characters in the search word
      const escapedWord = wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Count word occurrences (case-insensitive, whole word matching)
      // Using 'g' flag only since text is already lowercase
      const regex = new RegExp(`\\b${escapedWord}\\b`, 'g');
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;

      results[wordLower].quarters.push({
        quarter: quarterLabel,
        count: count,
        date: transcript.date || ''
      });

      results[wordLower].total += count;

      // Track highest/lowest
      if (count > results[wordLower].highest.count) {
        results[wordLower].highest = { quarter: quarterLabel, count };
      }
      if (count < results[wordLower].lowest.count) {
        results[wordLower].lowest = { quarter: quarterLabel, count };
      }
    });
  });

  // Calculate averages and trends
  Object.keys(results).forEach(wordKey => {
    const data = results[wordKey];
    data.average = data.quarters.length > 0 ? (data.total / data.quarters.length).toFixed(2) : 0;

    // Calculate trend (compare older vs newer quarters)
    // NOTE: Quarters are sorted newest first, so we need to compare in reverse
    if (data.quarters.length >= 4) {
      const midpoint = Math.floor(data.quarters.length / 2);
      const recentQuarters = data.quarters.slice(0, midpoint); // Most recent half
      const olderQuarters = data.quarters.slice(midpoint); // Older half

      const recentAvg = recentQuarters.reduce((sum, q) => sum + q.count, 0) / recentQuarters.length;
      const olderAvg = olderQuarters.reduce((sum, q) => sum + q.count, 0) / olderQuarters.length;

      const changePercent = ((recentAvg - olderAvg) / (olderAvg || 1)) * 100;

      if (changePercent > 15) {
        data.trend = 'increasing';
      } else if (changePercent < -15) {
        data.trend = 'decreasing';
      } else {
        data.trend = 'stable';
      }
    }

    // PolyMarket Prediction: Based on last 4 quarters only (more predictive)
    const last4Quarters = data.quarters.slice(0, Math.min(4, data.quarters.length));
    const last4Total = last4Quarters.reduce((sum, q) => sum + q.count, 0);
    const last4Avg = last4Quarters.length > 0 ? last4Total / last4Quarters.length : 0;

    // Prediction confidence based on consistency and recent mentions
    const mentioned = last4Quarters.filter(q => q.count > 0).length;
    const mentionRate = last4Quarters.length > 0 ? (mentioned / last4Quarters.length) * 100 : 0;

    let prediction = 'unlikely';
    if (mentionRate >= 75 || last4Avg >= 3) {
      prediction = 'highly_likely'; // 75%+ mention rate or 3+ avg mentions
    } else if (mentionRate >= 50 || last4Avg >= 1) {
      prediction = 'likely'; // 50%+ mention rate or 1+ avg mentions
    } else if (mentionRate >= 25 || last4Avg > 0) {
      prediction = 'possible'; // 25%+ mention rate or any mentions
    }

    data.last4Avg = last4Avg.toFixed(2);
    data.last4Total = last4Total;
    data.mentionRate = mentionRate.toFixed(0);
    data.prediction = prediction;

    // PHASE 1: Consistency Score & Traffic Light System
    const totalQuarters = data.quarters.length;
    const quartersMentioned = data.quarters.filter(q => q.count > 0).length;
    const consistencyPercent = totalQuarters > 0 ? (quartersMentioned / totalQuarters) * 100 : 0;

    // Traffic Light Color (based on ALL quarters, not just last 4)
    let trafficLight = 'RED';
    let riskLevel = 'High Risk';
    if (consistencyPercent >= 80) {
      trafficLight = 'GREEN';
      riskLevel = 'Low Risk';
    } else if (consistencyPercent >= 50) {
      trafficLight = 'AMBER';
      riskLevel = 'Medium Risk';
    }

    // Bond Rating System (based on consistency)
    let bondRating = 'B';
    if (consistencyPercent >= 87.5) {
      bondRating = 'AAA';
    } else if (consistencyPercent >= 75) {
      bondRating = 'AA';
    } else if (consistencyPercent >= 62.5) {
      bondRating = 'A';
    } else if (consistencyPercent >= 50) {
      bondRating = 'BBB';
    } else if (consistencyPercent >= 37.5) {
      bondRating = 'BB';
    }

    data.totalQuarters = totalQuarters;
    data.quartersMentioned = quartersMentioned;
    data.consistencyPercent = consistencyPercent.toFixed(0);
    data.trafficLight = trafficLight;
    data.riskLevel = riskLevel;
    data.bondRating = bondRating;

    // Trading Recommendation (based on consistency, prediction, and recent performance)
    let recommendation = 'WAIT';
    let recommendationReason = '';
    const consistencyFormatted = consistencyPercent.toFixed(2);

    if (trafficLight === 'GREEN' && last4Avg >= 1) {
      recommendation = 'BUY';
      recommendationReason = `Strong consistency (${consistencyFormatted}%) with ${last4Avg} avg mentions in last 4Q`;
    } else if (trafficLight === 'GREEN' && last4Avg < 1) {
      recommendation = 'WAIT';
      recommendationReason = `Good consistency but low recent mentions (${last4Avg} avg)`;
    } else if (trafficLight === 'AMBER' && last4Avg >= 1.5) {
      recommendation = 'BUY';
      recommendationReason = `Recent momentum strong despite medium consistency`;
    } else if (trafficLight === 'AMBER') {
      recommendation = 'WAIT';
      recommendationReason = `Medium consistency (${consistencyFormatted}%) - proceed with caution`;
    } else if (trafficLight === 'RED' && last4Avg >= 2) {
      recommendation = 'WAIT';
      recommendationReason = `Inconsistent historically but recent uptick (${last4Avg} avg)`;
    } else {
      recommendation = 'AVOID';
      recommendationReason = `Low consistency (${consistencyFormatted}%) with weak recent performance`;
    }

    data.recommendation = recommendation;
    data.recommendationReason = recommendationReason;
  });

  return {
    ticker: transcripts[0]?.ticker || 'UNKNOWN',
    analyzedWords: Object.values(results)
  };
}

// Get context excerpts for a keyword from the most recent quarter
app.get('/api/context/:ticker/:keyword', async (req, res) => {
  try {
    const { ticker, keyword } = req.params;

    // Input validation
    if (!ticker || !keyword) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Ticker and keyword are required'
      });
    }

    // Validate ticker format (1-5 uppercase letters)
    if (!/^[A-Z]{1,5}$/i.test(ticker)) {
      return res.status(400).json({
        error: 'Invalid ticker',
        message: 'Ticker must be 1-5 letters'
      });
    }

    // Validate keyword length (prevent DoS)
    if (keyword.length > 100) {
      return res.status(400).json({
        error: 'Invalid keyword',
        message: 'Keyword must be less than 100 characters'
      });
    }

    const cacheKey = ticker.toUpperCase();
    console.log(`📖 Fetching context for "${keyword}" in ${cacheKey}...`);

    // Check cache first
    let transcriptsData = transcriptCache.get(cacheKey);

    // If not in cache, fetch transcripts
    if (!transcriptsData) {
      const apiKey = process.env.API_FINHUB_KEY;
      if (!apiKey || apiKey === 'your_api_key_here') {
        return res.status(500).json({
          error: 'Configuration error',
          message: 'Server is not properly configured. Please contact support.'
        });
      }

      console.log(`📡 Fetching transcripts for ${cacheKey} from Finnhub...`);
      const { transcripts, error } = await fetchLatestTranscript(cacheKey, apiKey);

      if (transcripts.length === 0) {
        return res.status(404).json({
          error: 'No transcripts found',
          message: `No earnings call transcripts available for ticker ${cacheKey}.`
        });
      }

      transcriptsData = {
        ticker: cacheKey,
        transcripts: transcripts
      };

      // Cache the result
      transcriptCache.set(cacheKey, transcriptsData);
    }

    // Get the most recent quarter's transcript
    const mostRecentTranscript = transcriptsData.transcripts[0];

    if (!mostRecentTranscript || !mostRecentTranscript.transcript) {
      return res.status(404).json({
        error: 'Transcript not available',
        message: `Transcript for ${cacheKey} is not available.`
      });
    }

    // Extract excerpts for the keyword
    const excerpts = extractKeywordContext(
      mostRecentTranscript.transcript,
      keyword,
      10 // Max 10 excerpts
    );

    // Count total mentions
    const transcriptLower = mostRecentTranscript.transcript.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'g');
    const matches = transcriptLower.match(regex);
    const totalMentions = matches ? matches.length : 0;

    const result = {
      keyword: keyword,
      ticker: cacheKey,
      quarter: mostRecentTranscript.quarter,
      year: mostRecentTranscript.year,
      excerpts: excerpts,
      totalMentions: totalMentions
      // transcriptUrl removed for security - no need to expose API structure
    };

    console.log(`✓ Found ${totalMentions} mentions, returning ${excerpts.length} excerpts`);
    res.json(result);

  } catch (error) {
    // Log detailed error server-side only
    console.error('❌ Error fetching context:', error.message);
    console.error('Stack trace:', error.stack);

    // Return generic error to client (prevent information leakage)
    res.status(500).json({
      error: 'Failed to fetch context',
      message: 'An error occurred while fetching transcript context. Please try again.'
    });
  }
});

// Helper function to extract context around keyword occurrences
function extractKeywordContext(transcript, keyword, maxExcerpts = 10) {
  const keywordLower = keyword.toLowerCase();
  const excerpts = [];

  // Split transcript into sentences (rough approximation)
  const sentences = transcript.split(/(?<=[.!?])\s+/);

  // Search through sentences for keyword
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceLower = sentence.toLowerCase();

    // Check if keyword is in this sentence (whole word match)
    const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');

    if (regex.test(sentenceLower)) {
      // Get context: current sentence + 1 before + 1 after
      const contextSentences = [];

      // Add previous sentence if available
      if (i > 0) {
        contextSentences.push(sentences[i - 1]);
      }

      // Add current sentence
      contextSentences.push(sentence);

      // Add next sentence if available
      if (i < sentences.length - 1) {
        contextSentences.push(sentences[i + 1]);
      }

      // Join and clean up
      let excerpt = contextSentences.join(' ').trim();

      // Limit to approximately 150 words to keep it readable
      const words = excerpt.split(/\s+/);
      if (words.length > 150) {
        excerpt = words.slice(0, 150).join(' ') + '...';
      }

      // Add ellipsis at the start if not beginning of transcript
      if (i > 0) {
        excerpt = '...' + excerpt;
      }

      // Add ellipsis at end if not end of transcript
      if (i < sentences.length - 1 && words.length <= 150) {
        excerpt = excerpt + '...';
      }

      excerpts.push(excerpt);

      // Stop if we've reached max excerpts
      if (excerpts.length >= maxExcerpts) {
        break;
      }
    }
  }

  return excerpts;
}

// Helper functions for AI summary caching
function getCachedSummary(ticker, quarter, keyword) {
  try {
    const cacheData = JSON.parse(fs.readFileSync(SUMMARIES_CACHE_FILE, 'utf8'));
    const cacheKey = `${ticker}_${quarter}_${keyword}`.toLowerCase();

    if (cacheData[cacheKey]) {
      const cached = cacheData[cacheKey];
      const cacheAge = Date.now() - cached.timestamp;
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      // Return cached if less than 30 days old
      if (cacheAge < thirtyDays) {
        console.log(`✓ Using cached summary for ${cacheKey}`);
        return cached.summary;
      } else {
        console.log(`⚠️  Cache expired for ${cacheKey}`);
      }
    }
  } catch (err) {
    console.error('Error reading cache:', err.message);
  }

  return null;
}

function saveSummaryToCache(ticker, quarter, keyword, summary) {
  try {
    const cacheData = JSON.parse(fs.readFileSync(SUMMARIES_CACHE_FILE, 'utf8'));
    const cacheKey = `${ticker}_${quarter}_${keyword}`.toLowerCase();

    cacheData[cacheKey] = {
      summary: summary,
      timestamp: Date.now()
    };

    fs.writeFileSync(SUMMARIES_CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf8');
    console.log(`✓ Saved summary to cache for ${cacheKey}`);
  } catch (err) {
    console.error('Error writing to cache:', err.message);
  }
}

// Generate AI summary using OpenAI
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { ticker, quarter, keyword, excerpts } = req.body;

    // Input validation
    if (!ticker || !quarter || !keyword || !excerpts) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'ticker, quarter, keyword, and excerpts are required'
      });
    }

    // Validate ticker format (1-5 uppercase letters)
    if (!/^[A-Z]{1,5}$/i.test(ticker)) {
      return res.status(400).json({
        error: 'Invalid ticker',
        message: 'Ticker must be 1-5 letters'
      });
    }

    // Validate quarter format (Q1-Q4 YYYY)
    if (!/^Q[1-4]\s\d{4}$/.test(quarter)) {
      return res.status(400).json({
        error: 'Invalid quarter',
        message: 'Quarter must be in format "Q1 2025"'
      });
    }

    // Validate keyword length
    if (keyword.length > 100) {
      return res.status(400).json({
        error: 'Invalid keyword',
        message: 'Keyword must be less than 100 characters'
      });
    }

    // Validate excerpts is an array with at least 1 item
    if (!Array.isArray(excerpts) || excerpts.length === 0) {
      return res.status(400).json({
        error: 'Invalid excerpts',
        message: 'Excerpts must be a non-empty array'
      });
    }

    console.log(`🤖 Generating AI summary for ${ticker} ${quarter} - "${keyword}"`);

    // Check cache first
    const cachedSummary = getCachedSummary(ticker, quarter, keyword);
    if (cachedSummary) {
      return res.json({
        summary: cachedSummary.summary,
        tradingInsight: cachedSummary.tradingInsight,
        cached: true
      });
    }

    // Check if OpenAI is available
    if (!openai) {
      return res.status(503).json({
        error: 'AI summary unavailable',
        message: 'OpenAI API key not configured. AI summaries are temporarily unavailable.'
      });
    }

    // Prepare excerpts for OpenAI (limit to first 5 to stay within token limits)
    const limitedExcerpts = excerpts.slice(0, 5);
    const excerptsText = limitedExcerpts.map((e, i) => `${i + 1}. ${e}`).join('\n\n');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing earnings call transcripts for traders making predictions on PolyMarket.'
        },
        {
          role: 'user',
          content: `Analyze these excerpts from ${ticker} ${quarter} earnings call about '${keyword}' and provide:

1) SUMMARY (2-3 sentences): What did the company say and why does it matter?

2) TRADING INSIGHT (1 sentence): Will the CEO likely mention '${keyword}' in the next quarter? Be specific and actionable for PolyMarket predictions.

Excerpts:
${excerptsText}

Format your response as:
SUMMARY: [your summary]
TRADING INSIGHT: [your insight]`
        }
      ]
    });

    const response = completion.choices[0].message.content;

    // Parse the response
    const summaryMatch = response.match(/SUMMARY:\s*(.+?)(?=TRADING INSIGHT:|$)/s);
    const insightMatch = response.match(/TRADING INSIGHT:\s*(.+?)$/s);

    const summary = summaryMatch ? summaryMatch[1].trim() : response;
    const tradingInsight = insightMatch ? insightMatch[1].trim() : 'Unable to generate trading insight.';

    const result = {
      summary: summary,
      tradingInsight: tradingInsight
    };

    // Save to cache
    saveSummaryToCache(ticker, quarter, keyword, result);

    console.log(`✓ AI summary generated for ${ticker} ${quarter} - "${keyword}"`);

    res.json({
      summary: summary,
      tradingInsight: tradingInsight,
      cached: false
    });

  } catch (error) {
    // Log detailed error server-side only
    console.error('❌ Error generating AI summary:', error.message);
    console.error('Stack trace:', error.stack);

    // Check for specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        error: 'AI summary unavailable',
        message: 'OpenAI quota exceeded. AI summaries are temporarily unavailable.'
      });
    }

    // Return generic error to client
    res.status(500).json({
      error: 'Failed to generate AI summary',
      message: 'An error occurred while generating the AI summary. Please try again.'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔒 Security headers enabled (Helmet)`);
  console.log(`📊 Ready to analyze earnings transcripts`);
});
