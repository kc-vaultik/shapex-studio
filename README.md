# ShapeX - Autonomous AI Venture Studio

ShapeX is an autonomous idea generator that identifies high-potential startup opportunities by analyzing:
- **Strategic Channel**: YCombinator and A16Z RFS (Requests for Startups) and VC forecasts
- **Quick-Win Channel**: Market gaps, trend data, and Product Hunt insights

## Architecture

- **Backend (Python)**: FastAPI, Claude API, data scrapers, scheduled scanning
- **Frontend (Node.js)**: Express, real-time dashboard, trend visualization
- **Database**: SQLite (upgradeable to PostgreSQL)
- **Notifications**: Telegram integration

## Features

### Data Collection
- YCombinator RFS scraper
- A16Z blog and forecast analyzer
- Product Hunt trending products API
- Google Trends integration
- Market gap analysis

### AI-Powered Analysis
- Idea generation using Claude API
- Feasibility scoring (technical, market, competition)
- Monetization potential assessment
- Time-to-market estimation
- Risk analysis

### Automation
- Scheduled daily scans (9 AM)
- Weekly deep-dive reports (Friday 5 PM)
- On-demand analysis via API or Telegram
- Real-time dashboard updates

### Output Channels
- Web dashboard with visualizations
- Telegram daily summaries
- REST API for programmatic access
- Markdown weekly reports

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Telegram Bot Token (optional)
- Anthropic Claude API Key

### Installation

```bash
# Clone and navigate
cd shapex

# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Configuration
cp config/.env.example config/.env
# Edit config/.env with your API keys
```

### Running ShapeX

```bash
# Start backend (Terminal 1)
cd backend
venv\Scripts\activate
python main.py

# Start frontend (Terminal 2)
cd frontend
npm start
```

Access dashboard at: http://localhost:3001

## Project Structure

```
shapex/
├── backend/
│   ├── app/
│   │   ├── scrapers/         # Data collection modules
│   │   ├── analyzers/        # AI analysis engines
│   │   ├── models/           # Database models
│   │   ├── api/              # FastAPI endpoints
│   │   └── services/         # Business logic
│   ├── main.py               # Backend entry point
│   └── requirements.txt
├── frontend/
│   ├── server.js             # Express server
│   ├── public/               # Static assets
│   └── views/                # Dashboard UI
├── config/
│   ├── .env                  # API keys and secrets
│   └── settings.json         # App configuration
├── data/
│   └── shapex.db             # SQLite database
└── logs/                     # Application logs
```

## API Endpoints

### Ideas
- `GET /api/ideas` - List all generated ideas
- `GET /api/ideas/{id}` - Get idea details
- `POST /api/ideas/generate` - Trigger on-demand generation

### Analytics
- `GET /api/trends` - Current market trends
- `GET /api/stats` - ShapeX statistics
- `GET /api/opportunities/strategic` - YC/A16Z opportunities
- `GET /api/opportunities/quick-wins` - Quick-win ideas

### Scanning
- `POST /api/scan/now` - Run immediate scan
- `GET /api/scan/status` - Check scan status
- `GET /api/scan/schedule` - View scan schedule

## Configuration

Edit `config/.env`:

```env
# API Keys
ANTHROPIC_API_KEY=your_claude_api_key
TELEGRAM_BOT_TOKEN=your_telegram_token (optional)
TELEGRAM_USER_ID=your_telegram_id (optional)

# Scanning Schedule
DAILY_SCAN_TIME=09:00
WEEKLY_REPORT_DAY=friday
WEEKLY_REPORT_TIME=17:00

# Analysis Settings
MIN_FEASIBILITY_SCORE=6.0
MIN_MONETIZATION_SCORE=7.0
IDEAS_PER_SCAN=10
```

## Data Sources

### Strategic Channel
- [YCombinator RFS](https://www.ycombinator.com/rfs)
- [A16Z Blog](https://a16z.com/blog/)
- VC Twitter feeds (optional)

### Quick-Win Channel
- [Product Hunt API](https://api.producthunt.com/v2/docs)
- [Google Trends](https://trends.google.com)
- Reddit trending (r/SaaS, r/startups, r/Entrepreneur)
- Indie Hackers trending

## Scoring System

Each idea is scored on:
- **Feasibility** (1-10): Technical complexity, time to build, resources needed
- **Market Demand** (1-10): Search volume, trend momentum, pain point severity
- **Monetization** (1-10): Revenue potential, pricing model clarity, scalability
- **Competition** (1-10): Market saturation (inverse), differentiation potential
- **Risk** (1-10): Regulatory hurdles, technical risk, market timing

**Overall Score** = Weighted average with emphasis on monetization and demand.

## Roadmap

- [ ] Phase 1: Core data collection (YC, A16Z, Product Hunt)
- [ ] Phase 2: AI idea generation engine
- [ ] Phase 3: Dashboard and visualization
- [ ] Phase 4: Telegram integration
- [ ] Phase 5: Advanced trend analysis (Reddit, Twitter)
- [ ] Phase 6: Automated validation (landing page tests, surveys)
- [ ] Phase 7: Integration with development tools (GitHub, Vercel)

## Cost Estimates

- **Anthropic Claude API**: ~$20-100/month (depends on scan frequency)
- **Product Hunt API**: Free (500 requests/day)
- **Google Trends**: Free
- **Hosting**: $0 (local) or $10-25/month (cloud)

**Total**: ~$20-125/month

## License

MIT License - Built by kc-vaultik

## Support

For issues or questions, check the logs at `logs/shapex.log` or create an issue.
