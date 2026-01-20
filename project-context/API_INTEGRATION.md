# Finnhub API Integration

## Current Status: FREE Tier Mode

Using the **Finnhub Earnings Call Transcript API** on the FREE tier.

### FREE Tier Benefits

| Feature | FREE Tier |
|---------|-----------|
| API calls/minute | 60 |
| Transcripts access | Yes |
| Historical data | Back to 2001 |
| Coverage | US, UK, EU, AU, CA |

### Working Tickers (FREE Tier)
- AAPL - Apple
- MSFT - Microsoft
- GOOGL - Google
- AMZN - Amazon
- TSLA - Tesla
- META - Meta
- NVDA - Nvidia
- And many more major companies

## How It Works

### API Request Flow

```
User searches for AAPL
    ↓
Backend checks cache
    ↓ (if not cached)
Finnhub fetches transcript list
    ↓
Fetch most recent transcript by ID
    ↓
Response cached (30 min TTL)
    ↓
Transcript sent to frontend
    ↓
Analysis runs on that quarter
```

### API Endpoints

**List Transcripts:**
```
GET https://finnhub.io/api/v1/stock/transcripts/list?symbol=AAPL&token=YOUR_KEY
```

**Get Transcript:**
```
GET https://finnhub.io/api/v1/stock/transcripts?id=TRANSCRIPT_ID&token=YOUR_KEY
```

## Configuration

### Environment Variables

**Backend** (`backend/.env`):
```
API_FINHUB_KEY=your_finnhub_key_here
```

**Vercel** (production):
- Set `API_FINHUB_KEY` in Project Settings → Environment Variables

### API Security

- Key stored only in `.env` (excluded from git)
- Never exposed to frontend
- Only accessible to backend server

## Caching Strategy

- **TTL**: 30 minutes per ticker
- **Storage**: In-memory (resets on server restart)
- **Benefit**: Reduces API calls for repeated searches

## Error Handling

### No Transcript Error
```json
{
  "error": "No transcripts found",
  "message": "No earnings call transcripts available for ticker XYZ..."
}
```

### Rate Limit Error
```json
{
  "error": "Too many requests",
  "message": "API rate limit reached. Please try again in a moment."
}
```

## Monitoring

Watch backend logs:
```
📡 = Fetching from API
✅ = Successfully fetched
⚠️  = API warning
❌ = Failed request
```

---

*Last updated: January 2026*
*Status: Finnhub FREE Tier Active*
