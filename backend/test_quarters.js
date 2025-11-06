// Test script to verify quarter calculation logic
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth(); // 0-11
const currentQuarter = Math.floor(currentMonth / 3) + 1;

console.log('='.repeat(60));
console.log('QUARTER CALCULATION TEST');
console.log('='.repeat(60));
console.log(`\nToday: ${today.toISOString()}`);
console.log(`Year: ${currentYear}`);
console.log(`Month: ${currentMonth} (${today.toLocaleDateString('en-US', { month: 'long' })})`);
console.log(`Current Quarter: Q${currentQuarter} ${currentYear}`);

console.log(`\n${'='.repeat(60)}`);
console.log('QUARTERS TO REQUEST (starting from current):');
console.log('='.repeat(60));

let year = currentYear;
let quarter = currentQuarter;
const quarters = [];

for (let i = 0; i < 8; i++) {
  quarters.push(`Q${quarter} ${year}`);
  console.log(`[${i + 1}/8] Q${quarter} ${year}`);
  quarter--;
  if (quarter === 0) {
    quarter = 4;
    year--;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('VERIFICATION:');
console.log('='.repeat(60));
console.log(`Full list: ${quarters.join(', ')}`);
console.log(`\n✓ Q3 2024 included? ${quarters.includes('Q3 2024') ? 'YES ✅' : 'NO ❌'}`);
console.log(`✓ Q4 2024 included? ${quarters.includes('Q4 2024') ? 'YES ✅' : 'NO ❌'}`);
console.log(`✓ Most recent: ${quarters[0]}`);
console.log('='.repeat(60) + '\n');
