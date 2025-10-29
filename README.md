# Earnings Mention Tracker

A web application that analyzes word frequency trends across historical earnings call transcripts to gain an edge in PolyMarket mention markets.

## Overview

This tool helps traders make informed decisions on PolyMarket prediction markets by analyzing how frequently specific words appear in a company's earnings call transcripts over the last 8 quarters.

## Features

- **Company Analysis**: Start with Starbucks (SBUX), expandable to other companies
- **Word Tracking**: Track multiple words simultaneously (comma-separated input)
- **Historical Data**: Analyzes last 8 quarters of earnings transcripts
- **Visualizations**:
  - Interactive table with quarterly breakdown
  - Line chart showing trends over time
  - Quick stats cards with key metrics
- **Trend Detection**: Automatic identification of increasing/decreasing/stable trends
- **CSV Export**: Download analysis results for further processing
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React (with Vite)
- Chart.js + react-chartjs-2 for visualizations
- CSS3 with responsive design

### Backend
- Node.js with Express
- Axios for API calls
- CORS enabled
- In-memory caching

## Installation

1. **Clone the repository** (or you're already here!)

2. **Install dependencies for all parts**:
   ```bash
   npm run install-all
   ```

   Or install manually:
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Configure API Key** (optional for MVP):
   - Edit `backend/.env` file
   - Add your API Ninja key: `API_NINJA_KEY=your_actual_key_here`
   - For testing, the app will use mock data if no key is provided

## Running the Application

### Run both frontend and backend together:
```bash
npm run dev
```

### Or run them separately:

**Backend (Terminal 1)**:
```bash
npm run backend
```
Backend will run on http://localhost:3001

**Frontend (Terminal 2)**:
```bash
npm run frontend
```
Frontend will run on http://localhost:5173

## Usage

1. Open http://localhost:5173 in your browser
2. Enter a company ticker (default: SBUX)
3. Enter words to track, separated by commas (e.g., "holiday, pumpkin, rewards, mobile")
4. Click "Analyze Transcripts"
5. View results in:
   - **Quick Stats**: Summary cards for each word
   - **Quarterly Breakdown**: Detailed table view
   - **Trend Visualization**: Line chart showing patterns
6. Export data as CSV for further analysis

## API Endpoints

### Backend API

- `GET /api/health` - Health check endpoint
- `GET /api/transcripts/:ticker` - Fetch transcripts for a company
- `POST /api/analyze` - Analyze word frequency

## Project Structure

```
earnings-mention-tracker/
├── backend/
│   ├── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   └── server.js           # Express server
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── InputForm.jsx
│   │   │   ├── ResultsTable.jsx
│   │   │   ├── TrendChart.jsx
│   │   │   └── QuickStats.jsx
│   │   ├── App.jsx         # Main app component
│   │   ├── App.css         # App styles
│   │   └── index.css       # Global styles
│   └── package.json        # Frontend dependencies
├── package.json            # Root package with scripts
├── PRD.md                  # Product Requirements Document
└── README.md              # This file
```

## Word Analysis Details

The analysis engine:
- Performs **case-insensitive** word matching
- Uses **whole-word matching** (not partial matches)
- Calculates trends by comparing first half vs second half of data
- Identifies highest and lowest quarters for each word
- Computes average mentions per quarter

### Trend Indicators
- **↑ Increasing** (Green): >15% growth from first to second half
- **↓ Decreasing** (Red): >15% decline from first to second half
- **→ Stable** (Gray): Between -15% and +15% change

## Mock Data

For testing without an API key, the backend generates realistic mock data for Starbucks (SBUX) with:
- 8 quarters of transcripts (Q1 2023 - Q4 2024)
- Seasonally appropriate content (e.g., "holiday" mentions spike in Q4)
- Representative word frequencies

## Future Enhancements

### Phase 2
- Auto-scrape words from PolyMarket markets
- Add multiple companies simultaneously
- Historical PolyMarket pricing data overlay
- Email alerts for new transcripts

### Phase 3
- Twitter sentiment analysis integration
- AI prediction model for mention likelihood
- Mobile app version
- Multi-user support with saved portfolios

### Phase 4
- Expand beyond earnings calls
- Real-time transcript analysis during live calls
- Automated trading integration with PolyMarket

## Development Notes

- The app uses mock data by default for easy testing
- API Ninja integration is ready but requires a valid API key
- All transcript data is cached to minimize API calls
- CSV export works entirely client-side (no server processing)

## Cost Estimates

**MVP (Current)**:
- Vercel hosting: Free tier
- API calls: ~$0-50/month depending on usage
- Total: **$0-50/month**

## License

ISC

## Contributing

This is a personal project for PolyMarket trading. Feel free to fork and adapt for your own use!

## Questions to Resolve

See PRD.md for open questions about:
- Partial vs exact word matching
- Calendar vs fiscal quarters
- Trend threshold calculations

---

Built with React, Node.js, and Chart.js for PolyMarket traders
