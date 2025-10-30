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
    return res.status(500).json({
      error: 'Configuration error',
      message: envCheck.error
    });
  }

  return res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    security: 'enabled'
  });
}
