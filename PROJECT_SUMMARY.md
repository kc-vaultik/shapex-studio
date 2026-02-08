# ShapeX - Project Summary

## What is ShapeX?

ShapeX is an **autonomous AI venture studio** that continuously discovers high-potential startup opportunities by analyzing:
- YCombinator Requests for Startups (RFS)
- Andreessen Horowitz (A16Z) blog posts and forecasts
- Product Hunt trending products
- Google Trends market momentum

Using Claude AI, ShapeX generates scored, actionable startup ideas across two channels:

1. **Strategic Channel**: VC-backed, long-term opportunities (YC/A16Z-inspired)
2. **Quick-Win Channel**: Fast-to-build, bootstrap-friendly businesses (Product Hunt/trend-inspired)

## Why ShapeX?

- **Stay ahead of trends**: Automated daily scanning keeps you updated on emerging opportunities
- **AI-powered insights**: Claude Sonnet 4.5 analyzes market signals and generates ideas with reasoning
- **Actionable scoring**: 5-dimensional scoring system helps prioritize ideas
- **Two paths to success**: Choose between VC-backed ambitions or quick bootstrap wins
- **Repeatable process**: Generate new ideas on-demand or automatically

## Tech Stack

### Backend (Python)
- **FastAPI**: REST API with interactive docs
- **SQLAlchemy**: Database ORM
- **Anthropic Claude API**: AI idea generation
- **BeautifulSoup**: Web scraping (YC, A16Z)
- **pytrends**: Google Trends analysis
- **APScheduler**: Automated scanning

### Frontend (Node.js)
- **Express**: Web server
- **EJS**: Templating
- **Chart.js**: Trend visualizations
- **Axios**: API communication

### Database
- **SQLite**: Default (lightweight, no setup)
- Upgradeable to PostgreSQL for production

### Optional Integrations
- **Product Hunt API**: Better trending product data
- **Telegram Bot**: Automatic notifications (reuse your telegram-claude-agent setup)

## Project Structure

```
shapex/
├── backend/               # Python FastAPI backend
│   ├── app/
│   │   ├── scrapers/     # YC, A16Z, Product Hunt scrapers
│   │   ├── analyzers/    # Claude AI idea generator
│   │   ├── models/       # Database schema
│   │   ├── api/          # REST API endpoints
│   │   └── services/     # Scanner orchestration & scheduler
│   └── main.py           # Backend entry point
├── frontend/             # Node.js Express frontend
│   ├── views/            # EJS templates (dashboard, ideas)
│   ├── public/           # CSS, JavaScript
│   └── server.js         # Frontend server
├── config/
│   └── .env              # Configuration (API keys, settings)
├── data/
│   └── shapex.db         # SQLite database
├── logs/
│   └── shapex.log        # Application logs
├── README.md             # Complete documentation
├── QUICKSTART.md         # 10-minute setup guide
├── USAGE_GUIDE.md        # Detailed usage instructions
├── setup.bat             # One-time setup script
├── start-backend.bat     # Launch backend
└── start-frontend.bat    # Launch frontend
```

## Key Features

### 1. Data Collection
- **YC RFS Scraper**: Extracts startup requests from YCombinator
- **A16Z Blog Scraper**: Analyzes VC insights and investment theses
- **Product Hunt Scraper**: Fetches trending products and categories
- **Google Trends Analyzer**: Tracks keyword momentum and growth rates

### 2. AI Idea Generation
- **Claude Sonnet 4.5**: Generates startup ideas with detailed reasoning
- **Context-aware**: Uses VC insights and trend data as input
- **Structured output**: Title, description, category, target market, revenue model, features, competitors, differentiation
- **Actionable metrics**: Time to build, startup cost estimates

### 3. Scoring System
Each idea scored 1-10 on:
- **Feasibility** (15% weight): Technical achievability
- **Market Demand** (30% weight): Customer need strength
- **Monetization** (35% weight): Revenue clarity
- **Competition** (10% weight): Competitive landscape
- **Risk** (10% weight): Execution risk

**Overall Score Formula:**
```
Overall = (Feasibility × 0.15) + (Market Demand × 0.30) +
          (Monetization × 0.35) + (Competition × 0.10) +
          (Risk × 0.10)
```

### 4. Automation
- **Daily Scans**: 9 AM by default (configurable)
- **Weekly Reports**: Friday 5 PM (configurable)
- **On-Demand**: Manual scans via dashboard or API
- **Telegram Notifications**: Optional daily summaries and weekly reports

### 5. Dashboard
- Real-time statistics
- Top strategic opportunities
- Top quick-win opportunities
- Market trends visualization
- Idea filtering and search
- Detailed idea pages with scores and reasoning

### 6. REST API
Full programmatic access:
- List ideas with filters
- Trigger scans
- View trends
- Get statistics
- Update idea status/notes
- Mark favorites

## Workflow

### Automated Daily Flow
1. **9:00 AM**: ShapeX triggers daily scan
2. **Data Collection** (30-60s): Scrapes YC, A16Z, Product Hunt, Google Trends
3. **AI Analysis** (60-90s): Claude generates 10 scored ideas (5 strategic + 5 quick-win)
4. **Storage**: Ideas saved to database with full metadata
5. **Notification**: Telegram message with top 3 ideas (if enabled)
6. **Dashboard Update**: New ideas appear immediately

### Manual On-Demand Flow
1. Click "Run Scan Now" on dashboard
2. Scan runs in background
3. Reload page to see new ideas

### Weekly Report Flow
1. **Friday 5:00 PM**: ShapeX generates comprehensive report
2. Full scan with all data sources
3. Telegram notification with top 5 ideas of the week
4. Statistics and trend insights

## Configuration Options

### Scan Settings
- `DAILY_SCAN_TIME`: When to run daily scans (default: 09:00)
- `WEEKLY_REPORT_DAY`: Day for weekly report (default: friday)
- `WEEKLY_REPORT_TIME`: Time for weekly report (default: 17:00)
- `ENABLE_SCHEDULED_SCANS`: Enable/disable automation (default: true)

### Quality Filters
- `MIN_FEASIBILITY_SCORE`: Minimum feasibility required (default: 6.0)
- `MIN_MONETIZATION_SCORE`: Minimum monetization required (default: 7.0)
- `IDEAS_PER_SCAN`: Total ideas to generate (default: 10)
- `MAX_IDEAS_PER_CHANNEL`: Per channel limit (default: 5)

### Data Sources
- `ENABLE_YC_SCRAPER`: Enable YC scraping (default: true)
- `ENABLE_A16Z_SCRAPER`: Enable A16Z scraping (default: true)
- `ENABLE_PRODUCT_HUNT`: Enable Product Hunt (default: true)
- `ENABLE_GOOGLE_TRENDS`: Enable Google Trends (default: true)

### Integrations
- `TELEGRAM_BOT_TOKEN`: Telegram bot token (optional)
- `TELEGRAM_USER_ID`: Your Telegram user ID (optional)
- `PRODUCT_HUNT_API_KEY`: Product Hunt API key (optional, improves data quality)

## Cost Analysis

### Anthropic Claude API
- **Per Scan**: ~$0.50-2.00 (depends on amount of context)
- **Daily Scans**: ~$15-60/month
- **On-Demand Only**: ~$5-20/month

### Other APIs
- **Product Hunt**: Free (500 requests/day limit)
- **Google Trends**: Free (no API key needed)

### Hosting
- **Local**: $0 (run on your machine)
- **Cloud**: $10-25/month (DigitalOcean, Railway, AWS)

**Total**: ~$20-100/month depending on usage

## Use Cases

### For Entrepreneurs
- **Discover opportunities**: Find validated startup ideas aligned with VC interests
- **Spot trends early**: Act on emerging markets before they're saturated
- **Validate hunches**: See if your idea aligns with current market momentum
- **Build quickly**: Focus on quick-win ideas for fast monetization

### For VCs/Investors
- **Deal flow**: Discover investment opportunities early
- **Market intelligence**: Track emerging trends and gaps
- **Thesis validation**: See if market aligns with investment thesis

### For Developers
- **Side projects**: Find quick-win ideas to build on weekends
- **Portfolio**: Build 2-4 week projects to showcase skills
- **Learning**: Explore trending tech stacks and markets

### For Agencies
- **Client prospecting**: Identify businesses that need your services
- **Product ideas**: Build and sell niche tools
- **Market research**: Automated trend monitoring for clients

## Success Metrics

ShapeX helps you answer:
- ✅ What startup ideas are VCs looking for RIGHT NOW?
- ✅ What's trending on Product Hunt this week?
- ✅ Which markets are growing fastest on Google Trends?
- ✅ What can I build in 2-4 weeks and monetize immediately?
- ✅ What's the competitive landscape for [idea]?
- ✅ What's the feasibility and revenue potential of [idea]?

## Future Enhancements

Potential additions:
- [ ] Reddit trending posts (r/SaaS, r/startups, r/Entrepreneur)
- [ ] Indie Hackers trending
- [ ] Twitter/X VC account monitoring
- [ ] Hacker News "Ask HN" analysis
- [ ] Automated landing page generation for validation
- [ ] Integration with no-code tools (Bubble, Webflow, Framer)
- [ ] GitHub repository creation with boilerplate
- [ ] Competitive analysis deep-dives
- [ ] Market sizing estimation
- [ ] CAC/LTV calculation
- [ ] Integration with development tools (Vercel, Railway, Supabase)

## Getting Started

See `QUICKSTART.md` for 10-minute setup instructions.

**TL;DR:**
1. Run `setup.bat`
2. Edit `config/.env` with your Anthropic API key
3. Run `start-backend.bat`
4. Run `start-frontend.bat`
5. Visit http://localhost:3001
6. Click "Run Scan Now"

## Questions?

Check:
- `README.md` - Complete documentation
- `USAGE_GUIDE.md` - Detailed usage and best practices
- `logs/shapex.log` - Error logs
- FastAPI docs - http://localhost:8000/docs

---

**Built by kc-vaultik | Powered by Claude Sonnet 4.5**
