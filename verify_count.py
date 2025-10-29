import json
import re
import sys

# Read from stdin
data = json.load(sys.stdin)

quarter = sys.argv[1] if len(sys.argv) > 1 else 'Q3 2025'
word = sys.argv[2] if len(sys.argv) > 2 else 'holiday'

# Find the transcript
transcript_obj = [t for t in data['transcripts'] if t['quarter'] == quarter]
if not transcript_obj:
    print(f"Quarter {quarter} not found!")
    sys.exit(1)

transcript_obj = transcript_obj[0]
text = transcript_obj['transcript']

print(f'===== WORD COUNT VERIFICATION =====')
print(f'Quarter: {quarter}')
print(f'Word: "{word}"')
print(f'Transcript length: {len(text):,} characters')
print()

# Case-insensitive whole-word search
pattern = r'\b' + re.escape(word.lower()) + r'\b'
text_lower = text.lower()
matches = list(re.finditer(pattern, text_lower))

print(f'Total matches found: {len(matches)}')
print()

if len(matches) > 0:
    print('===== ALL OCCURRENCES WITH CONTEXT =====')
    for i, match in enumerate(matches, 1):
        # Get position
        start = match.start()
        end = match.end()

        # Get context (100 chars before and after)
        context_start = max(0, start - 100)
        context_end = min(len(text), end + 100)

        # Get the actual text with context
        before = text[context_start:start]
        matched_text = text[start:end]
        after = text[end:context_end]

        print(f'\n{i}. Position {start}-{end}:')
        print(f'   ...{before}[{matched_text}]{after}...')
        print()
else:
    print(f'No matches found for "{word}" in {quarter}')
    print()
    # Check if word appears at all (without word boundaries)
    if word.lower() in text_lower:
        print(f'NOTE: "{word}" appears in the transcript but not as a complete word.')
        print('It may be part of another word or have different casing/punctuation.')
