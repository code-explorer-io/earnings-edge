const fs = require('fs');
const path = require('path');

// Load the transcripts
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'aapl_transcripts.json'), 'utf8'));
const transcripts = data.transcripts;

console.log('='.repeat(80));
console.log('DEBUGGING: Siri mentions in Apple earnings transcripts');
console.log('='.repeat(80));
console.log(`\nTotal quarters available: ${transcripts.length}`);
console.log('Quarters:', transcripts.map(t => t.quarter).join(', '));
console.log('\n');

// Search terms to check
const searchTerms = [
  'siri',
  "siri's",
  'voice assistant',
  'voice control',
  'virtual assistant',
  'digital assistant',
  'hey siri'
];

// Track overall results
const overallResults = {};
searchTerms.forEach(term => {
  overallResults[term] = { total: 0, byQuarter: {} };
});

// Process each transcript
transcripts.forEach((transcript, idx) => {
  const quarterLabel = transcript.quarter;
  const text = (transcript.transcript || '').toLowerCase();

  console.log(`\n${'='.repeat(80)}`);
  console.log(`QUARTER: ${quarterLabel}`);
  console.log(`${'='.repeat(80)}`);

  searchTerms.forEach(term => {
    const termLower = term.toLowerCase();
    const escapedTerm = termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');

    // Find all matches
    let match;
    const matches = [];
    const originalRegex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');

    while ((match = originalRegex.exec(text)) !== null) {
      matches.push(match.index);
    }

    const count = matches.length;

    if (count > 0) {
      console.log(`\n📍 "${term.toUpperCase()}" found ${count} time(s):`);
      console.log('-'.repeat(80));

      // Show context for each match
      matches.forEach((matchIndex, i) => {
        // Get surrounding context (200 chars before and after)
        const start = Math.max(0, matchIndex - 200);
        const end = Math.min(text.length, matchIndex + term.length + 200);
        let context = text.substring(start, end);

        // Try to find sentence boundaries
        const sentenceStart = context.lastIndexOf('. ', 200);
        const sentenceEnd = context.indexOf('. ', 200 + term.length);

        if (sentenceStart > 0) {
          context = context.substring(sentenceStart + 2);
        }
        if (sentenceEnd > 0) {
          context = context.substring(0, sentenceEnd + 1);
        }

        // Highlight the search term
        const highlightRegex = new RegExp(`(\\b${escapedTerm}\\b)`, 'gi');
        context = context.replace(highlightRegex, '>>> $1 <<<');

        console.log(`\nMatch ${i + 1}:`);
        console.log(`"${context.trim()}"`);
      });

      overallResults[term].total += count;
      overallResults[term].byQuarter[quarterLabel] = count;
    }
  });
});

// Summary
console.log('\n\n');
console.log('='.repeat(80));
console.log('SUMMARY: Total mentions across all quarters');
console.log('='.repeat(80));

searchTerms.forEach(term => {
  const result = overallResults[term];
  if (result.total > 0) {
    console.log(`\n"${term.toUpperCase()}": ${result.total} total mentions`);
    console.log('  By quarter:');
    Object.keys(result.byQuarter).forEach(q => {
      console.log(`    ${q}: ${result.byQuarter[q]}`);
    });
  } else {
    console.log(`\n"${term.toUpperCase()}": 0 mentions`);
  }
});

// Additional check: Search for any capitalized word starting with "Siri"
console.log('\n\n');
console.log('='.repeat(80));
console.log('BONUS CHECK: Any words starting with "Siri"');
console.log('='.repeat(80));

transcripts.forEach(transcript => {
  const text = transcript.transcript || '';
  const regex = /\bSiri\w*/gi;
  const matches = text.match(regex);

  if (matches) {
    const unique = [...new Set(matches.map(m => m.toLowerCase()))];
    console.log(`\n${transcript.quarter}: Found variants: ${unique.join(', ')}`);
  }
});

console.log('\n\n=== Debug Complete ===\n');
