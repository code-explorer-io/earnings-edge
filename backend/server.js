import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
      console.log(`Serving ${cacheKey} from cache`);
      return res.json(transcriptCache.get(cacheKey));
    }

    // API Ninja endpoint for earnings transcripts
    const apiKey = process.env.API_NINJA_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      // Return mock data for development/testing
      console.log('No API key configured, returning mock data');
      const mockData = generateMockTranscripts(ticker);
      transcriptCache.set(cacheKey, mockData);
      return res.json(mockData);
    }

    // Fetch from API Ninja
    const response = await axios.get(`https://api.api-ninjas.com/v1/earningstranscript`, {
      headers: { 'X-Api-Key': apiKey },
      params: { ticker: cacheKey }
    });

    // Cache the result
    transcriptCache.set(cacheKey, response.data);
    res.json(response.data);

  } catch (error) {
    console.error('Error fetching transcripts:', error.message);

    // On error, return mock data as fallback
    const { ticker } = req.params;
    const mockData = generateMockTranscripts(ticker);
    res.json(mockData);
  }
});

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

      // Count word occurrences (case-insensitive, whole word matching)
      const regex = new RegExp(`\\b${wordLower}\\b`, 'gi');
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

    // Calculate trend (compare first half vs second half)
    if (data.quarters.length >= 4) {
      const midpoint = Math.floor(data.quarters.length / 2);
      const firstHalfAvg = data.quarters.slice(0, midpoint).reduce((sum, q) => sum + q.count, 0) / midpoint;
      const secondHalfAvg = data.quarters.slice(midpoint).reduce((sum, q) => sum + q.count, 0) / (data.quarters.length - midpoint);

      const changePercent = ((secondHalfAvg - firstHalfAvg) / (firstHalfAvg || 1)) * 100;

      if (changePercent > 15) {
        data.trend = 'increasing';
      } else if (changePercent < -15) {
        data.trend = 'decreasing';
      } else {
        data.trend = 'stable';
      }
    }
  });

  return {
    ticker: transcripts[0]?.ticker || 'UNKNOWN',
    analyzedWords: Object.values(results)
  };
}

// Generate mock transcripts for testing
function generateMockTranscripts(ticker) {
  const quarters = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];

  const mockTranscripts = quarters.map((quarter, index) => {
    let transcript = '';

    // Add seasonally appropriate content for Starbucks with realistic patterns
    if (ticker.toUpperCase() === 'SBUX') {
      if (quarter.includes('Q1')) {
        // Q1 - New Year period, post-holiday
        transcript = `Good afternoon and welcome to Starbucks Q1 earnings call. Thank you for joining us today.

I'm pleased to report another strong quarter for Starbucks. Our mobile app continues to drive digital engagement, with mobile orders representing a growing portion of transactions. The Starbucks Rewards program reached new milestones this quarter with record member growth.

While we saw the typical post-holiday slowdown in January, our rewards members remained highly engaged through personalized offers delivered via our mobile platform. Digital channels, particularly mobile ordering, helped us maintain strong customer connections during the slower winter months.

Looking ahead, we're excited about spring launches and continue investing in our mobile technology infrastructure. The rewards program will be central to our customer retention strategy. We're also testing new mobile features to enhance the customer experience.

Traffic patterns normalized after the holiday season, but our focus on operational excellence and the strength of our rewards ecosystem kept same-store sales positive. Mobile order and pay now accounts for approximately 25% of transactions at company-operated stores.

Thank you, and we'll now take your questions.`;
      } else if (quarter.includes('Q2')) {
        // Q2 - Spring season
        transcript = `Good afternoon and welcome to Starbucks Q2 earnings call.

Q2 was a solid quarter with strong momentum in our digital business. Mobile orders continued their upward trajectory, and our Starbucks Rewards program added over 2 million new members. The rewards program now has a robust active member base that drives consistent traffic.

Spring seasonal beverages performed well, though not at holiday levels. We saw increased engagement through our mobile app, with customers using mobile order ahead to skip the line during busy morning hours. The convenience factor of mobile continues to resonate with our customers.

Our rewards members are highly valuable - they visit more frequently and spend more per transaction. We're leveraging mobile notifications and personalized rewards to drive frequency. The mobile platform allows us to communicate directly with our most loyal customers.

Digital initiatives remain a top priority. Mobile and rewards together create a powerful flywheel for customer engagement. We continue investing in technology to make the mobile ordering experience seamless.

Operationally, we're focused on throughput during peak hours, especially with the growth in mobile orders. Overall, a strong quarter with promising trends in our digital ecosystem. Thank you.`;
      } else if (quarter.includes('Q3')) {
        // Q3 - Summer/Fall (pumpkin spice launch)
        transcript = `Good afternoon and welcome to Starbucks Q3 earnings call.

What an exciting quarter! We launched our pumpkin spice latte earlier than ever, and the response was phenomenal. Pumpkin spice remains one of our most popular seasonal offerings, with customers eagerly anticipating its return each year.

Our mobile app saw record downloads and usage this quarter, driven in part by exclusive early access to pumpkin spice for rewards members. This strategy paid off tremendously - rewards program enrollment surged. Mobile orders for pumpkin beverages were extremely strong.

The combination of pumpkin spice season and back-to-school traffic created perfect conditions for growth. Our rewards members received personalized offers featuring pumpkin products, delivered via mobile push notifications. The engagement rates were outstanding.

Mobile order and pay continued to gain traction, now representing nearly 30% of transactions. The convenience of mobile ordering is particularly valuable during our busy fall season. Customers love ordering their pumpkin spice latte ahead and picking it up on the way to work.

Beyond pumpkin, our full fall lineup performed well. But there's no question that pumpkin spice is the star of the season. We're already preparing for the holiday season ahead, with plans to leverage mobile and rewards to drive even stronger results. Thank you.`;
      } else {
        // Q4 - Holiday season
        transcript = `Good afternoon and welcome to Starbucks Q4 earnings call. What a phenomenal holiday quarter!

The holiday season delivered exceptional results across all metrics. Our holiday beverages, holiday merchandise, and holiday food offerings all performed above expectations. The holiday spirit was alive and well in our stores.

Holiday beverage sales were outstanding - peppermint mocha, eggnog latte, and our holiday blend were customer favorites. We also saw strong demand for holiday gift cards and holiday-themed merchandise. The holiday red cups created excitement and social media buzz.

Our mobile app and Starbucks Rewards program were game-changers this holiday season. Rewards members received early access to holiday offerings, and mobile ordering helped manage the holiday rush. Mobile orders during the holiday period increased significantly year-over-year.

The holiday promotional calendar was perfectly timed, with mobile push notifications alerting rewards members to holiday deals and new holiday drinks. Our rewards program grew substantially during the holiday quarter, with many customers joining specifically to access holiday benefits.

Holiday traffic was strong throughout November and December. Mobile ordering proved essential during peak holiday shopping days, allowing customers to skip long lines. The combination of holiday excitement and mobile convenience drove record transactions.

Looking ahead to Q1, we'll focus on retaining the customers we acquired during the holiday season through our rewards program and mobile engagement. Thank you for joining today's call.`;
      }
    } else {
      // Generic transcript for other companies
      transcript = `Good afternoon and welcome to ${ticker} ${quarter} earnings call. We had a solid quarter with revenue growth and operational improvements. Our digital initiatives and customer loyalty programs continue to perform well. We're focused on innovation, customer experience, and operational excellence. Thank you for joining us today.`;
    }

    return {
      ticker: ticker.toUpperCase(),
      quarter: quarter,
      date: `${index + 1}/15/202${3 + Math.floor(index / 4)}`,
      transcript: transcript
    };
  });

  return {
    ticker: ticker.toUpperCase(),
    transcripts: mockTranscripts
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Ready to analyze earnings transcripts`);
});
