import json
import re
import sys

# Read from stdin
data = json.load(sys.stdin)

# Find Q3 2025 transcript
q3 = [t for t in data['transcripts'] if t['quarter'] == 'Q3 2025'][0]
text = q3['transcript'].lower()

print('=== HOLIDAY WORD COUNT DEBUG ===')
print(f'Transcript length: {len(q3["transcript"])} chars')
print(f'Quarter: {q3["quarter"]}')
print()

# Count different variations
exact = re.findall(r'\bholiday\b', text)
plural = re.findall(r'\bholidays\b', text)
all_variants = re.findall(r'\bholiday[a-z]*\b', text)

print(f'"holiday" (exact): {len(exact)}')
print(f'"holidays" (plural): {len(plural)}')
print(f'All holiday variants: {len(all_variants)}')
print()

# Find all occurrences with context
print('=== ALL OCCURRENCES WITH CONTEXT ===')
count = 0
for match in re.finditer(r'holiday[a-z]*', text):
    count += 1
    start = max(0, match.start() - 50)
    end = min(len(text), match.end() + 50)
    context = text[start:end]
    print(f'{count}. ...{context}...')
    print()
