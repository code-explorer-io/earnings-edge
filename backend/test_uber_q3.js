// Test to verify UBER Q3 2025 is included in request list
console.log('='.repeat(70));
console.log('TESTING: UBER Q3 2025 DETECTION');
console.log('='.repeat(70));

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentQuarter = Math.floor(currentMonth / 3) + 1;

console.log(`\nCurrent Date: ${today.toISOString()}`);
console.log(`Current: Q${currentQuarter} ${currentYear}`);
console.log(`\nTarget: Q3 2025 (UBER transcript with date 2025-11-04)`);

let year = currentYear;
let quarter = currentQuarter;
const quarters = [];

console.log(`\nGenerating quarters list (starting from Q${quarter} ${year}):\n`);

for (let i = 0; i < 8; i++) {
  const quarterStr = `Q${quarter} ${year}`;
  quarters.push(quarterStr);

  const isQ3_2025 = (quarter === 3 && year === 2025);
  const marker = isQ3_2025 ? '  ← TARGET Q3 2025!' : '';

  console.log(`  [${i + 1}/8] ${quarterStr}${marker}`);

  // Decrement quarter
  quarter--;
  if (quarter === 0) {
    console.log(`       └─ Year rollover: ${year} → ${year - 1}`);
    quarter = 4;
    year--;
  }
}

console.log(`\n${'='.repeat(70)}`);
console.log('VERIFICATION RESULTS:');
console.log('='.repeat(70));

const hasQ3_2025 = quarters.includes('Q3 2025');
const q3Index = quarters.indexOf('Q3 2025');

console.log(`\n✓ Full quarter list: ${quarters.join(', ')}`);
console.log(`\n✓ Q3 2025 included? ${hasQ3_2025 ? '✅ YES' : '❌ NO'}`);

if (hasQ3_2025) {
  console.log(`✓ Q3 2025 position: [${q3Index + 1}/8]`);
  console.log(`✓ Q3 2025 will be requested from API Ninjas`);

  console.log(`\n📡 Expected API request:`);
  console.log(`   URL: https://api.api-ninjas.com/v1/earningstranscript`);
  console.log(`   Params: ticker=UBER, year=2025, quarter=3`);

  console.log(`\n✅ RESULT: Q3 2025 WILL BE REQUESTED`);
} else {
  console.log(`\n❌ ERROR: Q3 2025 NOT IN REQUEST LIST`);
  console.log(`This is a bug in the quarter generation logic!`);
}

console.log('='.repeat(70) + '\n');
