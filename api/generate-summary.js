// AI Summary generation endpoint using OpenAI
import { applySecurityMiddleware } from './_security.js';
import OpenAI from 'openai';

// Initialize OpenAI client
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

export default async function handler(req, res) {
  console.log('🤖 AI Summary API called');

  // Apply security middleware
  const securityCheck = applySecurityMiddleware(req, res);
  if (securityCheck.blocked) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      tradingInsight: tradingInsight,
      cached: false // Serverless functions don't have persistent cache
    };

    console.log(`✓ AI summary generated for ${ticker} ${quarter} - "${keyword}"`);

    return res.status(200).json(result);

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
    return res.status(500).json({
      error: 'Failed to generate AI summary',
      message: 'An error occurred while generating the AI summary. Please try again.'
    });
  }
}
