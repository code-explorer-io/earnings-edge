# Mock Data Guide

## Overview
The mock transcripts have been enhanced with realistic Starbucks earnings call content that demonstrates clear seasonal patterns and trends.

## Expected Word Frequency Patterns

### 1. "holiday" - Strong Seasonal Pattern (INCREASING TREND)
**Pattern**: Should spike dramatically in Q4 quarters (holiday season)

Expected counts by quarter:
- **Q1 2023**: 1-2 mentions (post-holiday)
- **Q2 2023**: 0-1 mentions (spring, minimal)
- **Q3 2023**: 0-1 mentions (summer/fall)
- **Q4 2023**: 10+ mentions (PEAK - holiday season)
- **Q1 2024**: 1-2 mentions (post-holiday)
- **Q2 2024**: 0-1 mentions (spring, minimal)
- **Q3 2024**: 1-2 mentions (preparing for holidays)
- **Q4 2024**: 12+ mentions (PEAK - holiday season)

**Visual**: Line chart should show clear spikes in Q4 of each year
**Trend**: Likely "increasing" as Q4 2024 has more mentions than Q4 2023

---

### 2. "pumpkin" - Fall Seasonal Pattern (STABLE)
**Pattern**: Should appear primarily in Q3 (pumpkin spice launch season)

Expected counts by quarter:
- **Q1 2023**: 0 mentions
- **Q2 2023**: 0 mentions
- **Q3 2023**: 8+ mentions (PEAK - pumpkin spice season)
- **Q4 2023**: 1-2 mentions (tail off)
- **Q1 2024**: 0 mentions
- **Q2 2024**: 0 mentions
- **Q3 2024**: 8+ mentions (PEAK - pumpkin spice season)
- **Q4 2024**: 0 mentions

**Visual**: Line chart should show spikes in Q3 of each year only
**Trend**: Likely "stable" as mentions are consistent year-over-year

---

### 3. "rewards" - Steady Growth Pattern (INCREASING TREND)
**Pattern**: Should increase gradually over time as the program grows

Expected counts by quarter:
- **Q1 2023**: 3-4 mentions
- **Q2 2023**: 5-6 mentions
- **Q3 2023**: 5-6 mentions
- **Q4 2023**: 4-5 mentions
- **Q1 2024**: 3-4 mentions
- **Q2 2024**: 6-7 mentions
- **Q3 2024**: 5-6 mentions
- **Q4 2024**: 4-5 mentions

**Visual**: Line chart should show consistent mentions across all quarters
**Trend**: Likely "increasing" or "stable" - rewards program is always discussed

---

### 4. "mobile" - Strong Growth Pattern (INCREASING TREND)
**Pattern**: Should show consistent high mentions with growth over time

Expected counts by quarter:
- **Q1 2023**: 5-6 mentions
- **Q2 2023**: 7-8 mentions
- **Q3 2023**: 6-7 mentions
- **Q4 2023**: 5-6 mentions
- **Q1 2024**: 5-6 mentions
- **Q2 2024**: 7-8 mentions
- **Q3 2024**: 7-8 mentions
- **Q4 2024**: 6-7 mentions

**Visual**: Line chart should show consistently high mentions every quarter
**Trend**: Likely "increasing" - mobile ordering is a growing focus

---

## How to Test

1. **Open the app**: http://localhost:5173

2. **Use default values**:
   - Ticker: `SBUX`
   - Words: `holiday, pumpkin, rewards, mobile`

3. **Click "Analyze Transcripts"**

4. **Observe the results**:

### Quick Stats Section
You should see 4 cards, one for each word:
- **holiday**: Look for trend 📈 (increasing)
- **pumpkin**: Look for trend ➡️ (stable)
- **rewards**: Look for trend 📈 or ➡️
- **mobile**: Look for trend 📈 (increasing)

### Quarterly Breakdown Table
- Check the Q4 rows - "holiday" should have the highest numbers
- Check the Q3 rows - "pumpkin" should have high numbers there only
- "rewards" and "mobile" should be relatively consistent across quarters

### Trend Visualization Chart
- **Holiday line** (blue): Should spike up in Q4 columns
- **Pumpkin line** (red): Should spike up in Q3 columns only
- **Rewards line** (green): Should be relatively flat with slight variations
- **Mobile line** (yellow): Should show steady or increasing pattern

### Color Coding
- **Green trends** (↑ increasing): Words growing in frequency
- **Red trends** (↓ decreasing): Words declining in frequency
- **Gray trends** (→ stable): Words with consistent frequency

---

## Testing Other Companies

Try entering a different ticker like `AAPL` or `TSLA`:
- You'll get generic mock transcripts
- Lower word counts (less detailed content)
- Good for testing the "no data" or "low frequency" scenarios

---

## Export and Verify

1. Click the **"📥 Export CSV"** button
2. Open the downloaded file in Excel or a text editor
3. Verify the counts match what you see in the table
4. Use the CSV for your own analysis or verification

---

## What This Demonstrates

✅ **Seasonal patterns**: How words spike during specific quarters
✅ **Trend detection**: Algorithm correctly identifies increasing/decreasing/stable trends
✅ **Visual analysis**: Charts make patterns immediately obvious
✅ **Data export**: CSV allows deeper analysis in other tools
✅ **Real-world use case**: Mimics actual PolyMarket prediction scenarios

## Example PolyMarket Use Case

**Market Question**: "Will Starbucks say 'holiday' 10+ times in their Q4 2024 earnings call?"

**Your Analysis**:
1. Run the tool with word: `holiday`
2. See that Q4 2023 had 10+ mentions
3. See trend is "increasing"
4. See Q4 2024 pattern continues
5. **Decision**: ✅ BET YES - strong historical pattern + increasing trend

---

Enjoy testing the app! 🚀
