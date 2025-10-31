// Shared security utility for Vercel serverless functions

// CORS whitelist - production domains only
const ALLOWED_ORIGINS = [
  'https://my-first-project-five-delta.vercel.app',
  'https://my-first-project-sean-mccloskeys-projects.vercel.app',
  'https://my-first-project-seanmccloskey10-4109-sean-mccloskeys-projects.vercel.app',
  'https://earningsedge.io',
  'https://www.earningsedge.io'
];

// Rate limiting - in-memory store (resets when function cold starts)
const requestTracker = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // 100 requests per window

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(res, origin) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Referrer-Policy', 'no-referrer');

  // CORS headers with whitelist validation
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Only allow whitelisted origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
}

/**
 * Validate CORS origin
 */
export function validateOrigin(req) {
  const origin = req.headers.origin;

  // Allow requests with no origin (direct API calls, curl, etc.)
  if (!origin) {
    return true;
  }

  // Check if origin is in whitelist
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Check rate limit for IP address
 */
export function checkRateLimit(req) {
  // Get client IP from various headers (Vercel provides these)
  const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
             req.headers['x-real-ip'] ||
             'unknown';

  const now = Date.now();
  const key = `ip:${ip}`;

  // Get or initialize request data for this IP
  let requestData = requestTracker.get(key);

  if (!requestData) {
    requestData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    requestTracker.set(key, requestData);
  }

  // Reset if window has expired
  if (now > requestData.resetTime) {
    requestData.count = 0;
    requestData.resetTime = now + RATE_LIMIT_WINDOW;
  }

  // Increment request count
  requestData.count++;

  // Check if limit exceeded
  if (requestData.count > RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: requestData.resetTime
    };
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - requestData.count,
    resetTime: requestData.resetTime
  };
}

/**
 * Validate environment variables
 */
export function validateEnvironment() {
  if (!process.env.API_NINJA_KEY || process.env.API_NINJA_KEY === 'your_api_key_here') {
    return {
      valid: false,
      error: 'API_NINJA_KEY not configured in Vercel environment variables'
    };
  }
  return { valid: true };
}

/**
 * Handle CORS preflight OPTIONS request
 */
export function handleCorsPreFlight(req, res) {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    applySecurityHeaders(res, origin);
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Apply all security checks and headers
 * Returns null if request should proceed, or response object if blocked
 */
export function applySecurityMiddleware(req, res) {
  const origin = req.headers.origin;

  // Apply security headers first
  applySecurityHeaders(res, origin);

  // Handle CORS preflight
  if (handleCorsPreFlight(req, res)) {
    return { blocked: true };
  }

  // Validate origin (only for requests with origin header)
  if (origin && !validateOrigin(req)) {
    console.log(`❌ Blocked origin: ${origin}`);
    return {
      blocked: true,
      response: res.status(403).json({
        error: 'Forbidden',
        message: 'Origin not allowed'
      })
    };
  }

  // Check rate limit
  const rateLimit = checkRateLimit(req);
  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    console.log(`❌ Rate limit exceeded for IP: ${req.headers['x-forwarded-for']}`);
    return {
      blocked: true,
      response: res.status(429).json({
        error: 'Too many requests',
        message: 'You have exceeded the 100 requests in 15 minutes limit. Please wait before making more requests.',
        retryAfter: `${retryAfterSeconds} seconds`
      })
    };
  }

  // All checks passed
  return { blocked: false };
}
