# API Ninjas Integration

## Current Status: FREE Tier Mode

Using the **API Ninjas Earnings Call Transcript API** on the FREE tier.

### FREE Tier Limitations

| Feature | FREE Tier | Premium Tier |
|---------|-----------|--------------|
| Quarters per request | **Latest only** | Last 8 quarters |
| Year/quarter params | Not available | Available |
| Ticker availability | Major tickers only | All tickers |
| API calls/month | 3,000 | Higher limits |

### Premium-Only Tickers (Not Available on FREE)
- SNOW (Snowflake)
- COIN (Coinbase)
- And others...

### Working Tickers (FREE Tier)
- AAPL - Apple
- MSFT - Microsoft
- GOOGL - Google
- AMZN - Amazon
- SBUX - Starbucks
- COST - Costco
- TSLA - Tesla
- META - Meta
- PLTR - Palantir

## How It Works

### API Request Flow (FREE Tier)

```
User searches for AAPL
    ↓
Backend checks cache
    ↓ (if not cached)
API Ninjas fetches LATEST transcript only
    ↓
Response cached (30 min TTL)
    ↓
Single transcript sent to frontend
    ↓
Analysis runs on that quarter
```

### API Endpoint

**FREE Tier** (current):
```
GET https://api.api-ninjas.com/v1/earningstranscript?ticker=AAPL
```
- No year/quarter params (premium only)
- Returns the most recent earnings call

**Premium Tier** (if upgraded):
```
GET https://api.api-ninjas.com/v1/earningstranscript?ticker=AAPL&year=2024&quarter=3
```
- Allows specifying year and quarter
- Can fetch historical data

## Configuration

### Environment Variables

**Backend** (`backend/.env`):
```
API_NINJA_KEY=your_api_key_here
```

**Vercel** (production):
- Set `API_NINJA_KEY` in Project Settings → Environment Variables

### API Security

- Key stored only in `.env` (excluded from git)
- Never exposed to frontend
- Only accessible to backend server

## Caching Strategy

- **TTL**: 30 minutes per ticker
- **Storage**: In-memory (resets on server restart)
- **Benefit**: Reduces API calls for repeated searches

## Error Handling

### Premium Ticker Error
```json
{
  "error": "Premium ticker",
  "message": "SNOW transcripts require a premium API Ninjas subscription...",
  "isPremium": true
}
```

### No Transcript Error
```json
{
  "error": "No transcripts found",
  "message": "No earnings call transcripts available for ticker XYZ..."
}
```

## Upgrading to Premium

To get multi-quarter historical data:

1. Upgrade at [API Ninjas](https://api-ninjas.com)
2. Update the code to add `year` and `quarter` params back
3. Restore the `fetchLast8Quarters` function

The code for 8-quarter fetching is in git history if needed.

## Monitoring

Watch backend logs:
```
📡 = Fetching from API
✅ = Successfully fetched
⚠️  = API error or premium ticker
❌ = Failed request
```

---

*Last updated: November 2024*
*Status: FREE Tier Active*
