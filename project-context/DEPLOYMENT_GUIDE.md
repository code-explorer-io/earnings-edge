# Vercel Deployment Guide for EarningsEdge

## Overview
This guide walks you through deploying the EarningsEdge earnings tracker app to Vercel.

## Prerequisites
- Vercel account (vercel.com/seanmccloskey10-4109)
- API Ninjas API key for earnings transcripts

## Project Structure
```
my-first-project/
├── api/                    # Vercel serverless functions
│   ├── analyze.js         # POST /api/analyze
│   ├── health.js          # GET /api/health
│   ├── transcripts/
│   │   └── [ticker].js    # GET /api/transcripts/:ticker
│   └── package.json
├── frontend/              # React + Vite frontend
│   ├── src/
│   └── package.json
└── vercel.json           # Vercel configuration
```

## Deployment Steps

### 1. Login to Vercel
```bash
vercel login
```
Follow the prompts to authenticate with your Vercel account.

### 2. Deploy the App
From the project root directory:
```bash
vercel
```

During the first deployment, you'll be asked:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account (seanmccloskey10-4109)
- **Link to existing project?** → No
- **Project name?** → earnings-tracker (or your preferred name)
- **Directory with code?** → ./ (current directory)
- **Auto-detected settings?** → Yes

### 3. Configure Environment Variable
After the initial deployment, you need to add your API key:

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/seanmccloskey10-4109
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - **Name:** `API_NINJA_KEY`
   - **Value:** Your API Ninjas API key
   - **Environment:** Production, Preview, Development (select all)
5. Click "Save"

**Option B: Via CLI**
```bash
vercel env add API_NINJA_KEY
```
- Paste your API key when prompted
- Select all environments (Production, Preview, Development)

### 4. Redeploy with Environment Variables
After adding the environment variable:
```bash
vercel --prod
```

### 5. Your App is Live!
Your app will be available at:
- Production: `https://your-project-name.vercel.app`
- You can also add a custom domain in the Vercel dashboard

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `API_NINJA_KEY` | API Ninjas API key for earnings transcripts | `abc123...` |

## Getting Your API Ninjas Key

1. Go to https://api-ninjas.com/
2. Sign up for a free account
3. Navigate to "My Account" → "API Key"
4. Copy your API key
5. Add it to Vercel as described above

## Troubleshooting

### API Key Not Working
- Make sure the environment variable name is exactly `API_NINJA_KEY`
- Redeploy after adding environment variables: `vercel --prod`
- Check Vercel logs: `vercel logs`

### Build Errors
- Check that all dependencies are installed
- Verify `vercel.json` configuration
- Review build logs in the Vercel dashboard

### API Errors
- Check the Vercel function logs in the dashboard
- Verify the API key is valid
- Test with a major company ticker (AAPL, SBUX, MSFT)

## Useful Vercel CLI Commands

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# View project settings
vercel inspect

# Remove deployment
vercel rm [deployment-url]
```

## Local Development

To run locally with Vercel functions:
```bash
# Install Vercel CLI
npm install -g vercel

# Run local dev server
vercel dev
```

Or use the traditional method:
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev
```

## Project Features
- **Autocomplete Ticker Search:** Search from top 100 US companies
- **Visual Tag Input:** Add words with Enter or comma-separation
- **Real-time Analysis:** Analyze earnings call transcripts for word frequency
- **PolyMarket Insights:** Trading recommendations and predictions
- **Dark Mode Support:** Toggle between light and dark themes
- **CSV Export:** Export analysis results

## Support
- Vercel Documentation: https://vercel.com/docs
- API Ninjas Docs: https://api-ninjas.com/api
- GitHub Issues: Create an issue in your repository

## Notes
- Free Vercel tier includes 100GB bandwidth/month
- API Ninjas free tier: 50,000 API calls/month
- Serverless functions have a 10-second execution timeout
- Transcripts are cached in-memory during function lifetime
