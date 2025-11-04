import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

dotenv.config();

// Validate required environment variables
if (!process.env.API_NINJA_KEY || process.env.API_NINJA_KEY === 'your_api_key_here') {
  console.error('❌ ERROR: API_NINJA_KEY not found in environment variables');
  console.error('Please create a .env file with API_NINJA_KEY=your_key_here');
  process.exit(1);
}
console.log('✅ API key loaded successfully');

const app = express();
const PORT = process.env.PORT || 3001;

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

// CORS configuration with origin validation
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
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
app.use(express.json({ limit: '10mb' })); // Increase limit for large transcripts

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

// In-memory cache for transcripts
const transcriptCache = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get earnings transcripts for a company
app.get('/api/transcripts/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const cacheKey = ticker.toUpperCase();

    // Check cache first
    if (transcriptCache.has(cacheKey)) {
      console.log(`✓ Serving ${cacheKey} from cache`);
      return res.json(transcriptCache.get(cacheKey));
    }

    // API Ninja endpoint for earnings transcripts
    const apiKey = process.env.API_NINJA_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      console.error('❌ API key not configured');
      return res.status(500).json({
        error: 'API key not configured',
        message: 'Please configure API_NINJA_KEY in backend/.env file'
      });
    }

    console.log(`📡 Fetching real transcripts for ${cacheKey} from API Ninjas...`);

    // Fetch last 8 quarters from API Ninjas
    const transcripts = await fetchLast8Quarters(cacheKey, apiKey);

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

    // Cache the result
    transcriptCache.set(cacheKey, result);
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
      message: `API Error: ${errorMessage}. Please check your API key and try again.`,
      details: error.message
    });
  }
});

// Helper function to fetch last 8 quarters from API Ninjas
async function fetchLast8Quarters(ticker, apiKey) {
  const transcripts = [];

  // Calculate most recent quarter with CONFIRMED earnings data available
  // We go back 2 quarters because companies report earnings 2-6 weeks after quarter end
  // Example: Nov 2025 = Q4 2025 in progress, Q3 2025 just ended (data may not be ready)
  // So we start from Q2 2025 (definitely available)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  // Determine current quarter based on month
  // Q1: Jan-Mar (0-2), Q2: Apr-Jun (3-5), Q3: Jul-Sep (6-8), Q4: Oct-Dec (9-11)
  const currentQuarter = Math.floor(currentMonth / 3) + 1;

  // Go back 2 full quarters to ensure earnings data is available
  // Companies report 2-6 weeks after quarter end, so most recent quarter may not have data yet
  let year = currentYear;
  let quarter = currentQuarter - 2;

  // Handle year rollover for negative quarters
  if (quarter <= 0) {
    quarter += 4;
    year--;
  }

  console.log(`📅 Calculated starting quarter: Q${quarter} ${year} (Current: Q${currentQuarter} ${currentYear})`);

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
      const response = await axios.get(`https://api.api-ninjas.com/v1/earningstranscript`, {
        headers: { 'X-Api-Key': apiKey },
        params: {
          ticker: ticker,
          year: year,
          quarter: quarter
        },
        timeout: 10000
      });

      // API Ninjas returns the transcript data directly
      if (response.data && response.data.transcript) {
        return {
          ticker: ticker,
          quarter: `Q${quarter} ${year}`,
          year: year,
          quarterNum: quarter,
          date: response.data.date || `${quarter * 3}/15/${year}`,
          transcript: response.data.transcript
        };
      }
      return null;
    } catch (err) {
      console.log(`⚠️  Could not fetch Q${quarter} ${year}: ${err.message}`);
      return null;
    }
  });

  const results = await Promise.all(promises);

  // Filter out null results and sort by date (most recent first)
  return results
    .filter(t => t !== null)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year; // Most recent year first
      return b.quarterNum - a.quarterNum; // Most recent quarter first
    });
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
      const apiKey = process.env.API_NINJA_KEY;
      if (!apiKey || apiKey === 'your_api_key_here') {
        return res.status(500).json({
          error: 'API key not configured',
          message: 'Please configure API_NINJA_KEY in backend/.env file'
        });
      }

      console.log(`📡 Fetching transcripts for ${cacheKey} from API Ninjas...`);
      const transcripts = await fetchLast8Quarters(cacheKey, apiKey);

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔒 Security headers enabled (Helmet)`);
  console.log(`📊 Ready to analyze earnings transcripts`);
});
