# Cache Management Guide

## Problem Fixed
Production shows old transcript data (Q2 2025) while localhost shows fresh data (Q3 2025).

## Root Cause
Backend caches transcript data for performance. Production had stale cache from before Q3 2025 was available.

## Solution Implemented

### 1. Reduced Cache TTL
**Changed:** 4 hours → **30 minutes**
- File: `backend/server.js:118`
- Cache now expires every 30 minutes instead of 4 hours
- Allows more frequent updates while still reducing API calls

### 2. Created Cache Management Tool
**New file:** `frontend/public/clear-cache.html`

**Access at:** `https://earningsedge.io/clear-cache.html`

**Features:**
- Clear cache for specific ticker (e.g., UBER)
- Clear all cached data
- User-friendly interface with status messages
- No console access needed

---

## How to Use

### After Deploying to Production

1. **Deploy these changes to production** (push triggers auto-deploy on Vercel/Netlify)

2. **Access the cache manager:**
   ```
   https://earningsedge.io/clear-cache.html
   ```

3. **Clear UBER cache:**
   - Enter "UBER" in the ticker field
   - Click "Clear Cache for Ticker"
   - See success message

4. **Test fresh data:**
   - Go back to main app
   - Search for UBER again
   - Should now show Q3 2025 as most recent

---

## Available Tools (All in `/public` folder)

### 1. `/clear-cache.html` - Backend Cache Manager
**Purpose:** Clear cached transcript data to force fresh API fetch

**Use when:**
- Production shows old data
- New transcript available but not showing
- Need to force refresh of transcript list

**Actions:**
- Clear specific ticker cache
- Clear all cache

---

### 2. `/check-credits.html` - Credit Diagnostic Tool
**Purpose:** View and fix credit system issues

**Use when:**
- Credits showing 0
- Need to check credit status
- Want to see all localStorage data

**Actions:**
- View credit status
- Set credits to 25/10
- Force daily refresh
- Clear all data

---

### 3. `/reset-credits.html` - Simple Credit Manager
**Purpose:** Quick credit adjustments

**Use when:**
- Need fast credit changes
- Testing with different amounts
- Simple interface preferred

**Actions:**
- Set credits to 25/10/5
- Force daily refresh
- Clear all data

---

## Technical Details

### Cache TTL Configuration
```javascript
// backend/server.js:118
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
```

**Why 30 minutes?**
- Frequent enough for same-day updates
- Long enough to reduce API calls
- Good balance for testing and production

### Cache Clear API Endpoint
```javascript
POST /api/admin/clear-cache

// Clear specific ticker
Body: { "ticker": "UBER" }

// Clear all cache
Body: {}
```

### How Cache Works
1. First request for ticker → Fetch from API Ninjas → Cache for 30 minutes
2. Subsequent requests → Return cached data (fast)
3. After 30 minutes → Cache expires → Next request fetches fresh data
4. Manual clear → Immediate cache deletion → Next request fetches fresh data

---

## Deployment Checklist

- [x] Reduced cache TTL to 30 minutes
- [x] Created `clear-cache.html` tool
- [x] Moved tools to `public/` folder (included in build)
- [x] Committed and pushed to GitHub
- [ ] **Next:** Deploy to production
- [ ] **Then:** Access `https://earningsedge.io/clear-cache.html`
- [ ] **Finally:** Clear UBER cache and verify Q3 2025 shows

---

## Troubleshooting

### Tool Not Found (404)
**Problem:** Accessing `/clear-cache.html` returns 404

**Solution:**
- Wait for deployment to complete
- Check deployment logs
- Verify `public/clear-cache.html` exists in build output

---

### Cache Clear Not Working
**Problem:** Clicked "Clear Cache" but still seeing old data

**Possible causes:**
1. Frontend cache (browser cache) - Hard refresh (Ctrl+Shift+R)
2. Different backend URL - Check API endpoint in tool matches production
3. Cache wasn't present - Check success message

**Solution:**
- Try clearing browser cache
- Try "Clear ALL Cache" instead
- Wait 30 minutes for auto-expiry

---

### Still Shows Q2 2025
**Problem:** Cleared cache but UBER still shows Q2 2025

**Debug steps:**
1. Check backend is deployed with new code
2. Check backend logs for cache clear confirmation
3. Verify API Ninjas has Q3 2025 data
4. Try localhost to confirm Q3 2025 exists
5. Check if backend is calling correct API endpoint

---

## Future Improvements

### Option 1: Environment-Based TTL
```javascript
const CACHE_TTL = process.env.NODE_ENV === 'production'
  ? 60 * 60 * 1000  // 1 hour in production
  : 10 * 60 * 1000; // 10 minutes in development
```

### Option 2: Add Cache Status Endpoint
```javascript
GET /api/admin/cache-status
// Returns: { cacheSize, entries: [...] }
```

### Option 3: Automatic Nightly Cache Clear
```javascript
// Clear cache at midnight UTC daily
cron.schedule('0 0 * * *', () => {
  transcriptCache.clear();
  console.log('🌙 Nightly cache clear');
});
```

---

## Quick Reference

| Tool | URL | Purpose |
|------|-----|---------|
| Cache Manager | `/clear-cache.html` | Clear backend transcript cache |
| Credit Checker | `/check-credits.html` | Diagnose credit issues |
| Credit Reset | `/reset-credits.html` | Quick credit adjustments |

**All tools work on any domain** - localhost or production.

---

## Summary

1. **Cache TTL reduced:** 4 hours → 30 minutes
2. **New tool created:** `clear-cache.html` for easy cache management
3. **Tools deployed:** Now in `public/` folder (included in build)
4. **Next step:** Deploy to production, then access `/clear-cache.html` to clear UBER cache

**After deployment, UBER should show Q3 2025!**
