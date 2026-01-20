import { applySecurityMiddleware, validateEnvironment } from './_security.js';

export default async function handler(req, res) {
  // Apply security middleware (CORS, headers, rate limiting)
  const securityCheck = applySecurityMiddleware(req, res);
  if (securityCheck.blocked) {
    return; // Response already sent by middleware
  }

  // Validate environment variables
  const envCheck = validateEnvironment();
  if (!envCheck.valid) {
    // Log detailed error server-side, return generic message to client
    console.error('Environment validation failed:', envCheck.error);
    return res.status(500).json({
      error: 'Configuration error',
      message: 'Server is not properly configured. Please contact support.'
    });
  }

  return res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    security: 'enabled'
  });
}
