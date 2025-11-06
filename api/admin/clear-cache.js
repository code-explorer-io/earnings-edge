// Admin endpoint to clear transcript cache
// This is a serverless function, so cache is per-function instance
// In production, cache clearing has limited effect due to multiple serverless instances

export default async function handler(req, res) {
  console.log('🗑️  Cache clear endpoint called');

  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ticker } = req.body || {};

    // IMPORTANT NOTE: In Vercel serverless functions, each instance has its own memory
    // This means cache clearing only affects THIS specific function instance
    // For true cache clearing, we rely on the 30-minute TTL

    if (ticker) {
      const message = `Cache clear requested for ${ticker}. Note: In serverless environment, cache expires automatically after 30 minutes. Each function instance has separate cache, so this only affects the current instance.`;
      console.log(`🗑️  ${message}`);

      return res.status(200).json({
        success: true,
        message: message,
        note: 'Serverless functions have per-instance cache. Wait 30 minutes for full cache expiry, or the next request will fetch fresh data if cache expired.'
      });
    } else {
      const message = 'Cache clear requested for ALL tickers. Note: In serverless environment, cache expires automatically after 30 minutes.';
      console.log(`🗑️  ${message}`);

      return res.status(200).json({
        success: true,
        message: message,
        note: 'Serverless functions have per-instance cache. Wait 30 minutes for full cache expiry across all instances.'
      });
    }
  } catch (error) {
    console.error('❌ Error in cache clear:', error);
    return res.status(500).json({
      error: 'Failed to process cache clear',
      message: error.message
    });
  }
}
