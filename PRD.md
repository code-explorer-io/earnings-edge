PRODUCT REQUIREMENTS DOCUMENT (PRD)
Earnings Call Mention Market Analysis Tool

1. OVERVIEW
Product Name: Earnings Mention Tracker
Version: 1.0 (MVP)
Purpose: Analyze word frequency trends across historical earnings call transcripts to gain edge in PolyMarket mention markets
User: Personal use (single user)

2. PROBLEM STATEMENT
PolyMarket offers prediction markets on specific words being mentioned during earnings calls (e.g., "Will Starbucks say 'holiday' during their next earnings call?").
Current challenge: No easy way to analyze historical patterns of word usage across multiple quarters to make informed trading decisions.

3. SOLUTION
A simple web application that:

Fetches historical earnings call transcripts
Analyzes word frequency across the last 8 quarters
Displays trends visually to identify patterns
Helps predict likelihood of words being mentioned in upcoming calls


4. CORE FEATURES (MVP)
4.1 Input Interface

Company Selection: Start with Starbucks (SBUX ticker)
Word Input: Manual text box to paste words from PolyMarket (comma-separated list)
Quarter Selection: Automatically fetch last 8 earnings transcripts

4.2 Data Fetching

Transcript Source: API Ninja or similar transcript API service
Data Points: Last 8 quarterly earnings call transcripts for selected company
Error Handling: Clear messages if transcripts unavailable

4.3 Analysis Engine

Word Counting: Case-insensitive exact word matching
Frequency Tracking: Count mentions per quarter for each word
Trend Detection: Calculate quarter-over-quarter changes

4.4 Visualization Dashboard

Table View:

Rows: Each tracked word
Columns: Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8 (most recent on right)
Cells: Number of mentions per quarter
Total column showing sum across all quarters


Chart View:

Line graph showing word frequency over time
One line per word for easy comparison
X-axis: Quarters (chronological)
Y-axis: Mention count


Quick Stats:

Average mentions per quarter
Trend indicator (↑ increasing, ↓ decreasing, → stable)
Highest/lowest quarter for each word



4.5 Output Format

Clean, scannable interface
Ability to export data as CSV for further analysis
Color coding: Green for increasing trends, Red for decreasing, Gray for stable


5. TECHNICAL REQUIREMENTS
5.1 Frontend

Technology: Simple HTML/CSS/JavaScript or React
Hosting: Vercel (free tier) or similar
Design: Clean, minimal, mobile-responsive
No login required (personal use only)

5.2 Backend

Language: Node.js or Python
API Integration: API Ninja for earnings transcripts
Processing: Server-side word counting and analysis
Caching: Store fetched transcripts to minimize API calls

5.3 Data Storage

Option 1: Local browser storage (simplest for MVP)
Option 2: Lightweight database (SQLite or Firebase free tier)
Purpose: Cache transcripts, save analysis history


6. USER FLOW

User opens web app
Selects company: "Starbucks"
Enters words from PolyMarket: "holiday, pumpkin, rewards, mobile"
Clicks "Analyze"
App fetches last 8 Starbucks earnings transcripts
App counts word occurrences per quarter
Dashboard displays:

Table with quarterly breakdown
Line chart showing trends
Quick stats and indicators


User identifies patterns (e.g., "holiday" spikes in Q4, drops in Q2)
User makes informed PolyMarket trades


7. SUCCESS METRICS

Speed: Analysis completes in <10 seconds
Accuracy: 100% accurate word counts (verified against manual count)
Cost: Total monthly cost <$50 (API calls + hosting)
Usability: User can analyze a new company in <2 minutes


8. FUTURE ENHANCEMENTS (Post-MVP)
Phase 2:

Auto-scrape words from PolyMarket markets
Add multiple companies simultaneously
Historical PolyMarket pricing data overlay
Email alerts when new transcripts published

Phase 3:

X (Twitter) sentiment analysis integration
AI prediction model for mention likelihood
Mobile app version
Multi-user support with saved portfolios

Phase 4:

Expand beyond earnings calls (press releases, interviews)
Real-time transcript analysis during live calls
Automated trading integration with PolyMarket


9. CONSTRAINTS & ASSUMPTIONS
Budget: <$200/month (target <$50 for MVP)
Timeline: Working MVP in 1-2 weeks of vibe coding
API Limits: API Ninja free/paid tier sufficient for testing
Scope: Single company (Starbucks) for initial testing
User Base: Personal use only (no user accounts needed)

10. TECHNICAL STACK RECOMMENDATION

Frontend: React (for clean UI) or vanilla JavaScript (for speed)
Backend: Node.js with Express
API: API Ninja for transcripts
Hosting: Vercel (frontend) + Vercel Serverless Functions (backend)
Charts: Chart.js or Recharts library
Cost: $0-5/month (all free tiers)


11. MVP DELIVERABLES
✅ Simple web interface
✅ Starbucks transcript fetching (last 8 quarters)
✅ Manual word input
✅ Frequency table display
✅ Trend line chart
✅ CSV export
✅ Responsive design

12. QUESTIONS TO RESOLVE DURING BUILD

Exact API endpoint format for API Ninja
How to handle partial words vs. exact matches (e.g., "holiday" vs. "holidays")
Quarter date alignment (calendar vs. fiscal quarters)
Threshold for "trend" calculation (% change needed to show ↑/↓)