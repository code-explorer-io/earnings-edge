# API Ninjas Integration

## Current Status: Requires Premium Subscription

Using the **API Ninjas Earnings Call Transcript API**.

**Note:** As of January 2025, the earnings transcript endpoint requires a premium subscription ($59/month Developer tier).

### Premium Tier Features

| Feature | Developer Tier |
|---------|----------------|
| Cost | $59/month |
| API calls/month | 100,000 |
| Commercial use | Yes |
| Transcripts access | Yes |

### Supported Tickers (with Premium)
- AAPL - Apple
- MSFT - Microsoft
- GOOGL - Google
- AMZN - Amazon
- TSLA - Tesla
- META - Meta
- NVDA - Nvidia
- And 8,000+ more companies

## How It Works

### API Request Flow

```
User searches for AAPL
    ↓
Backend checks cache
    ↓ (if not cached)
API Ninjas fetches transcript
    ↓
Response cached (30 min TTL)
    ↓
Transcript sent to frontend
    ↓
Analysis runs on that quarter
```

### API Endpoint

```
GET https://api.api-ninjas.com/v1/earningstranscript?ticker=AAPL
Headers: X-Api-Key: YOUR_KEY
```

## Configuration

### Environment Variables

**Vercel** (production):
- Set `API_NINJA_KEY` in Project Settings → Environment Variables

**Backend** (`backend/.env`) for local development:
```
API_NINJA_KEY=your_api_ninjas_key_here
```

### API Security

- Key stored only in environment variables (excluded from git)
- Never exposed to frontend
- Only accessible to backend server

## Caching Strategy

- **TTL**: 30 minutes per ticker
- **Storage**: In-memory (resets on server restart)
- **Benefit**: Reduces API calls for repeated searches

## Error Handling

### Premium Required Error
```json
{
  "error": "Premium ticker",
  "message": "AAPL transcripts require a premium API Ninjas subscription...",
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

1. Go to https://api-ninjas.com/pricing
2. Subscribe to Developer tier ($59/month)
3. Your existing API key will be upgraded
4. Transcripts will start working immediately

---

*Last updated: January 2026*
*Status: Premium subscription required for transcript access*
