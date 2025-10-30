export default async function handler(req, res) {
  const apiKey = process.env.API_NINJA_KEY;

  return res.status(200).json({
    hasApiKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'none'
  });
}
