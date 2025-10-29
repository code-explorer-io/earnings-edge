import axios from 'axios';

async function testAnalyze() {
  try {
    // Get transcripts
    const transcriptsResponse = await axios.get('http://localhost:3001/api/transcripts/SBUX');
    const transcripts = transcriptsResponse.data.transcripts;

    console.log('=== TESTING ANALYZE ENDPOINT ===');
    console.log(`Fetched ${transcripts.length} transcripts\n`);

    // Analyze "Pumpkin Spice"
    const analyzeResponse = await axios.post('http://localhost:3001/api/analyze', {
      ticker: 'SBUX',
      words: ['Pumpkin Spice'],
      transcripts: transcripts
    });

    const wordData = analyzeResponse.data.analyzedWords[0];

    console.log('Word:', wordData.word);
    console.log('\nQuarterly Counts:');
    wordData.quarters.forEach(q => {
      console.log(`  ${q.quarter}: ${q.count} mentions`);
    });
    console.log('\nTotals:');
    console.log(`  Total: ${wordData.total}`);
    console.log(`  Last 4Q Avg: ${wordData.last4Avg}`);
    console.log(`  Consistency: ${wordData.consistencyPercent}%`);
    console.log(`  Quarters Mentioned: ${wordData.quartersMentioned}/${wordData.totalQuarters}`);
    console.log(`  Traffic Light: ${wordData.trafficLight}`);
    console.log(`  Recommendation: ${wordData.recommendation}`);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAnalyze();
