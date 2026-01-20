// Context extraction endpoint - Get keyword mentions from earnings transcript
import { applySecurityMiddleware, validateEnvironment } from '../../_security.js';

/**
 * Extract keyword context from transcript
 * Returns excerpts showing keyword usage with surrounding context
 */
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

/**
 * Fetch transcripts for ticker (reuses logic from transcripts endpoint)
 */
async function fetchTranscriptsForTicker(ticker, apiKey) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentQuarter = Math.floor(currentMonth / 3) + 1;

  let year = currentYear;
  let quarter = currentQuarter;

  const quartersToFetch = [];
  for (let i = 0; i < 8; i++) {
    quartersToFetch.push({ year, quarter });
    quarter--;
    if (quarter === 0) {
      quarter = 4;
      year--;
    }
  }

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
        return null;
      }

      const data = await response.json();

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
      console.error(`⚠️  Could not fetch Q${quarter} ${year}:`, err.message);
      return null;
    }
  });

  const results = await Promise.all(promises);

  return results
    .filter(t => t !== null)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.quarterNum - a.quarterNum;
    });
}

export default async function handler(req, res) {
  console.log('📖 Context API called:', req.query);

  // Apply security middleware
  const securityCheck = applySecurityMiddleware(req, res);
  if (securityCheck.blocked) {
    return;
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
    const { ticker, keyword } = req.query;

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

    const apiKey = process.env.API_NINJA_KEY;

    // Fetch transcripts
    console.log(`📡 Fetching transcripts for ${cacheKey} from API Ninjas...`);
    const transcripts = await fetchTranscriptsForTicker(cacheKey, apiKey);

    if (transcripts.length === 0) {
      return res.status(404).json({
        error: 'No transcripts found',
        message: `No earnings call transcripts available for ticker ${cacheKey}.`
      });
    }

    // Get the most recent quarter's transcript
    const mostRecentTranscript = transcripts[0];

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
    };

    console.log(`✓ Found ${totalMentions} mentions, returning ${excerpts.length} excerpts`);
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error fetching context:', error.message);
    console.error('Stack trace:', error.stack);

    return res.status(500).json({
      error: 'Failed to fetch context',
      message: 'Unable to fetch context at this time. Please try again later.'
    });
  }
}
