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
    if (data.quarters.length >= 4) {
      const midpoint = Math.floor(data.quarters.length / 2);
      const recentQuarters = data.quarters.slice(0, midpoint);
      const olderQuarters = data.quarters.slice(midpoint);

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

    // PolyMarket Prediction: Based on last 4 quarters only
    const last4Quarters = data.quarters.slice(0, Math.min(4, data.quarters.length));
    const last4Total = last4Quarters.reduce((sum, q) => sum + q.count, 0);
    const last4Avg = last4Quarters.length > 0 ? last4Total / last4Quarters.length : 0;

    // Prediction confidence based on consistency and recent mentions
    const mentioned = last4Quarters.filter(q => q.count > 0).length;
    const mentionRate = last4Quarters.length > 0 ? (mentioned / last4Quarters.length) * 100 : 0;

    let prediction = 'unlikely';
    if (mentionRate >= 75 || last4Avg >= 3) {
      prediction = 'highly_likely';
    } else if (mentionRate >= 50 || last4Avg >= 1) {
      prediction = 'likely';
    } else if (mentionRate >= 25 || last4Avg > 0) {
      prediction = 'possible';
    }

    data.last4Avg = last4Avg.toFixed(2);
    data.last4Total = last4Total;
    data.mentionRate = mentionRate.toFixed(0);
    data.prediction = prediction;

    // Consistency Score & Traffic Light System
    const totalQuarters = data.quarters.length;
    const quartersMentioned = data.quarters.filter(q => q.count > 0).length;
    const consistencyPercent = totalQuarters > 0 ? (quartersMentioned / totalQuarters) * 100 : 0;

    let trafficLight = 'RED';
    let riskLevel = 'High Risk';
    if (consistencyPercent >= 80) {
      trafficLight = 'GREEN';
      riskLevel = 'Low Risk';
    } else if (consistencyPercent >= 50) {
      trafficLight = 'AMBER';
      riskLevel = 'Medium Risk';
    }

    // Bond Rating System
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

    // Trading Recommendation
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ticker, words, transcripts } = req.body;

    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: 'Words array is required' });
    }

    if (!transcripts || !Array.isArray(transcripts)) {
      return res.status(400).json({ error: 'Transcripts array is required' });
    }

    const analysis = analyzeWordFrequency(words, transcripts);
    return res.status(200).json(analysis);

  } catch (error) {
    console.error('Error analyzing transcripts:', error.message);
    return res.status(500).json({
      error: 'Failed to analyze transcripts',
      details: error.message
    });
  }
}
