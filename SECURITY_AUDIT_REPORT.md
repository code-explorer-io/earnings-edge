# Security Audit Report
**Date:** October 30, 2025
**Auditor:** Claude Code Security Analysis
**Codebase:** EarningsEdge - PolyMarket Analytics Tool

---

## Executive Summary

This security audit identified **0 critical issues**, **2 medium-priority issues**, and **3 low-priority suggestions**. The codebase follows most security best practices, with no hardcoded API keys, no npm vulnerabilities, and proper environment variable usage. However, improvements are needed in CORS configuration, rate limiting, and input validation.

**Overall Security Rating:** 🟡 **MEDIUM** (Good foundation, needs hardening)

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### ✅ None Found

Great news! No critical security vulnerabilities were discovered. The API key is properly stored in `.env` and not committed to Git.

---

## 🟡 MEDIUM PRIORITY ISSUES (Fix Soon)

### 1. Overly Permissive CORS Configuration
**Severity:** MEDIUM
**Location:** `backend/server.js:12`
**Finding:**
```javascript
app.use(cors());  // ⚠️ Allows ANY origin to access the API
```

**Risk:**
- Any website can make requests to your API
- Opens door to CSRF attacks
- Allows unauthorized API usage, potentially hitting API Ninjas rate limits

**Recommended Fix:**
```javascript
// Replace line 12 with:
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']  // Your production domain
    : ['http://localhost:5173', 'http://localhost:5174'],       // Local development
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

**Add to `.env`:**
```
NODE_ENV=production  # Set this in production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

### 2. Error Messages Leak Internal Details
**Severity:** MEDIUM
**Location:** `backend/server.js:78-82`
**Finding:**
```javascript
res.status(statusCode).json({
  error: 'Failed to fetch transcripts',
  message: `API Error: ${errorMessage}. Please check your API key and try again.`,  // ⚠️ Leaks API error details
  details: error.message  // ⚠️ Exposes internal error details
});
```

**Risk:**
- Exposes API Ninjas error responses to attackers
- Could reveal API rate limits, authentication issues, or system architecture
- Error messages like "API key invalid" confirm attack vectors

**Recommended Fix:**
```javascript
// Replace with sanitized error responses:
const isDevelopment = process.env.NODE_ENV !== 'production';

res.status(statusCode).json({
  error: 'Failed to fetch transcripts',
  message: statusCode === 404
    ? `No earnings call transcripts available for ticker ${ticker}. Try a major company like SBUX, AAPL, MSFT, or GOOGL.`
    : 'An error occurred while fetching transcripts. Please try again later.',
  // Only include details in development
  ...(isDevelopment && { details: error.message })
});
```

---

## 🟢 LOW PRIORITY SUGGESTIONS (Best Practices)

### 3. No Rate Limiting on API Endpoints
**Severity:** LOW
**Location:** `backend/server.js` (missing)
**Finding:** API endpoints have no rate limiting, allowing unlimited requests.

**Risk:**
- Attackers can abuse your API endpoints
- Could exhaust your API Ninjas quota
- Potential for DDoS attacks

**Recommended Fix:**
```bash
npm install express-rate-limit
```

```javascript
// Add to backend/server.js after imports:
import rateLimit from 'express-rate-limit';

// Apply to transcript endpoint (most expensive)
const transcriptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply to analysis endpoint
const analyzeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 analyses per minute
  message: 'Too many analysis requests, please slow down.'
});

// Update routes:
app.get('/api/transcripts/:ticker', transcriptLimiter, async (req, res) => {
  // ... existing code
});

app.post('/api/analyze', analyzeLimiter, async (req, res) => {
  // ... existing code
});
```

---

### 4. Missing Input Sanitization for Ticker Symbol
**Severity:** LOW
**Location:** `backend/server.js:26-27`
**Finding:**
```javascript
const { ticker } = req.params;
const cacheKey = ticker.toUpperCase();  // ⚠️ No validation before use
```

**Risk:**
- Could accept malformed ticker symbols
- Potential for cache poisoning with unusual characters
- No length limits (could cause memory issues)

**Recommended Fix:**
```javascript
// Add validation function:
function validateTicker(ticker) {
  // Ticker symbols are typically 1-5 uppercase letters
  const tickerRegex = /^[A-Z]{1,5}$/;
  return tickerRegex.test(ticker);
}

// Update endpoint:
app.get('/api/transcripts/:ticker', transcriptLimiter, async (req, res) => {
  try {
    const { ticker } = req.params;
    const cacheKey = ticker.toUpperCase();

    // Validate ticker format
    if (!validateTicker(cacheKey)) {
      return res.status(400).json({
        error: 'Invalid ticker symbol',
        message: 'Ticker must be 1-5 uppercase letters (e.g., AAPL, MSFT)'
      });
    }

    // ... rest of existing code
  } catch (error) {
    // ... error handling
  }
});
```

---

### 5. Missing Security Headers
**Severity:** LOW
**Location:** `backend/server.js` (missing)
**Finding:** No security headers are set (X-Frame-Options, X-Content-Type-Options, etc.)

**Risk:**
- Vulnerable to clickjacking attacks
- No MIME-type sniffing protection
- Missing XSS protection headers

**Recommended Fix:**
```bash
npm install helmet
```

```javascript
// Add to backend/server.js:
import helmet from 'helmet';

// Add after app initialization
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## ✅ SECURITY STRENGTHS (What's Working Well)

### 1. ✅ API Key Management
- **Status:** EXCELLENT
- API key properly stored in `.env` file
- `.env` is listed in `.gitignore`
- No API key in Git history
- Uses `process.env.API_NINJA_KEY` everywhere (no hardcoding)
- Frontend never receives the API Ninjas key

### 2. ✅ No XSS Vulnerabilities
- **Status:** EXCELLENT
- No use of `dangerouslySetInnerHTML`
- No `innerHTML` manipulation
- No `eval()` usage
- React handles all rendering safely

### 3. ✅ No Dependency Vulnerabilities
- **Status:** EXCELLENT
- Backend: 0 vulnerabilities (111 dependencies)
- Frontend: 0 vulnerabilities (202 dependencies)
- Run `npm audit` regularly to maintain this

### 4. ✅ Proper Environment Variable Usage
- **Status:** GOOD
- Backend uses `dotenv` properly
- Frontend uses Vite's `import.meta.env`
- No sensitive data in frontend code

### 5. ✅ Input Validation on Words Array
- **Status:** GOOD
- `backend/server.js:153-155` validates words array exists and is an array
- Prevents null/undefined errors

---

## 📋 DEPLOYMENT SECURITY CHECKLIST

### Before Deploying to Production:

- [ ] **Set NODE_ENV to 'production'** in environment variables
- [ ] **Configure CORS** with specific allowed origins (not `cors()`)
- [ ] **Add rate limiting** to expensive endpoints
- [ ] **Install and configure Helmet** for security headers
- [ ] **Verify .env is NOT in build artifacts**
- [ ] **Set up API_NINJA_KEY** in production environment (Vercel/hosting platform)
- [ ] **Disable source maps** in production build:
  ```javascript
  // vite.config.js
  export default defineConfig({
    build: {
      sourcemap: false
    }
  })
  ```
- [ ] **Remove console.log statements** in production or use a logging service
- [ ] **Set up error monitoring** (e.g., Sentry) instead of exposing errors
- [ ] **Enable HTTPS only** (should be default on Vercel)
- [ ] **Add Content Security Policy** headers

---

## 🔒 DATA PRIVACY COMPLIANCE

### Current Status: ✅ GOOD

**What Data is Collected:**
- User-submitted ticker symbols (temporary)
- User-submitted keywords (temporary)
- No personally identifiable information (PII)
- No cookies or tracking

**Data Storage:**
- Transcripts cached in-memory (server restart clears cache)
- No database, no persistent user data

**Recommendations:**
- Add a Privacy Policy page explaining data usage
- Add "This tool does not store your data" disclaimer
- Consider adding analytics (optional) with user consent

---

## 📊 RISK ASSESSMENT MATRIX

| Issue | Severity | Likelihood | Impact | Priority |
|-------|----------|------------|--------|----------|
| Open CORS | Medium | High | Medium | **High** |
| Error Leakage | Medium | Medium | Low | **Medium** |
| No Rate Limiting | Low | Medium | Medium | **Medium** |
| No Input Sanitization | Low | Low | Low | **Low** |
| Missing Security Headers | Low | Low | Low | **Low** |

---

## 🎯 RECOMMENDED ACTION PLAN

### Week 1 (High Priority)
1. ✅ Fix CORS configuration
2. ✅ Sanitize error messages for production
3. ✅ Add rate limiting to API endpoints

### Week 2 (Medium Priority)
4. ✅ Add Helmet for security headers
5. ✅ Implement ticker validation
6. ✅ Disable source maps in production

### Ongoing
7. ✅ Run `npm audit` monthly
8. ✅ Monitor error logs for suspicious activity
9. ✅ Review and rotate API key if exposed

---

## 🚨 INCIDENT RESPONSE

### If API Key is Compromised:

1. **Immediately rotate the API key** at api-ninjas.com
2. Update `.env` with new key
3. Redeploy backend
4. Check API Ninjas usage logs for unauthorized requests
5. Review Git history to ensure key wasn't committed

### If Unusual API Usage Detected:

1. Check Vercel/hosting logs for suspicious IPs
2. Implement stricter rate limiting temporarily
3. Add IP blocking if needed
4. Monitor API Ninjas quota usage

---

## 📝 NOTES

- **API Ninjas Free Tier Limits:** Be aware of your monthly quota
- **Cache Strategy:** In-memory cache is good for development but consider Redis for production if scaling
- **Monitoring:** Consider adding application monitoring (e.g., Datadog, New Relic) for production

---

## ✅ AUDIT CONCLUSION

Your codebase demonstrates solid security fundamentals:
- ✅ No hardcoded secrets
- ✅ Proper environment variable usage
- ✅ No vulnerable dependencies
- ✅ No XSS vulnerabilities
- ✅ .env properly gitignored

**Main areas for improvement:**
- 🔧 CORS configuration
- 🔧 Error message sanitization
- 🔧 Rate limiting

**Next Steps:**
1. Implement the CORS fix (15 minutes)
2. Add rate limiting (30 minutes)
3. Sanitize error messages (15 minutes)
4. Deploy and test

**Overall:** This is a well-built application with good security practices. The recommended fixes are straightforward and will significantly harden the security posture before production deployment.

---

**Report Generated:** October 30, 2025
**Tools Used:** Manual code review, npm audit, Git history analysis
**Files Audited:** 50+ files across frontend, backend, and configuration
