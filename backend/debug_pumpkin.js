import axios from 'axios';

async function checkPumpkinSpice() {
  try {
    const response = await axios.get('http://localhost:3001/api/transcripts/SBUX');
    const transcripts = response.data.transcripts;

    const q3 = transcripts.find(t => t.quarter === 'Q3 2025');

    if (!q3) {
      console.log('Q3 2025 not found!');
      return;
    }

    console.log('=== PUMPKIN SPICE DEBUG ===');
    console.log(`Quarter: ${q3.quarter}`);
    console.log(`Transcript length: ${q3.transcript.length} chars\n`);

    const text = q3.transcript.toLowerCase();

    // Test different variations
    const variations = [
      'pumpkin spice',
      'pumpkin-spice',
      'pumpkin spice latte',
      'pumpkin',
      'spice'
    ];

    variations.forEach(term => {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = text.match(regex);
      console.log(`"${term}": ${matches ? matches.length : 0} matches`);
    });

    // Find all occurrences of "pumpkin" with context
    console.log('\n=== ALL "PUMPKIN" OCCURRENCES WITH CONTEXT ===');
    const pumpkinRegex = /pumpkin[^\s]*\s+[^\s]+/gi;
    const pumpkinMatches = q3.transcript.match(pumpkinRegex);

    if (pumpkinMatches) {
      pumpkinMatches.forEach((match, i) => {
        const idx = q3.transcript.toLowerCase().indexOf(match.toLowerCase());
        const start = Math.max(0, idx - 40);
        const end = Math.min(q3.transcript.length, idx + match.length + 60);
        const context = q3.transcript.substring(start, end);
        console.log(`\n${i + 1}. "${match}"`);
        console.log(`   Context: ...${context}...`);
      });
    } else {
      console.log('No pumpkin found at all!');
    }

    // Test the exact regex we use in the backend
    console.log('\n=== TESTING BACKEND REGEX ===');
    const searchTerm = 'pumpkin spice';
    const escapedWord = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const backendRegex = new RegExp(`\\b${escapedWord}\\b`, 'g');
    const backendMatches = text.match(backendRegex);
    console.log(`Backend regex pattern: /\\b${escapedWord}\\b/g`);
    console.log(`Matches with backend regex: ${backendMatches ? backendMatches.length : 0}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPumpkinSpice();
