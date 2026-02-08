# ShapeX Usage Guide

## Table of Contents
1. [Dashboard Overview](#dashboard-overview)
2. [Understanding Scores](#understanding-scores)
3. [Filtering Ideas](#filtering-ideas)
4. [Managing Ideas](#managing-ideas)
5. [Running Scans](#running-scans)
6. [API Usage](#api-usage)
7. [Advanced Configuration](#advanced-configuration)

---

## Dashboard Overview

### Homepage Sections

1. **Stats Overview**
   - Total ideas generated
   - Strategic vs. Quick-win breakdown
   - Average scores
   - Last scan information

2. **Top Strategic Opportunities**
   - VC-backed, long-term plays
   - Based on YC RFS and A16Z insights
   - Higher startup costs, longer timelines
   - Potential for VC funding

3. **Top Quick-Win Opportunities**
   - Fast-to-build, fast-to-monetize
   - Based on Product Hunt trends
   - Lower startup costs, shorter timelines
   - Bootstrappable businesses

4. **Market Trends**
   - Trending keywords from Google Trends
   - Momentum scores (0-100)
   - Growth rates (percentage)

---

## Understanding Scores

Each idea is scored on a 1-10 scale across five dimensions:

### 1. Feasibility Score (15% weight)
- How technically achievable is this idea?
- Can it be built with existing tools/skills?
- Are there major technical hurdles?

**8-10:** Simple tech stack, proven patterns
**5-7:** Moderate complexity, some unknowns
**1-4:** Highly complex, bleeding-edge tech

### 2. Market Demand Score (30% weight)
- How strong is the customer need?
- Is there existing search volume/interest?
- Are people actively looking for solutions?

**8-10:** Clear, urgent pain point
**5-7:** Moderate interest, nice-to-have
**1-4:** Unproven demand

### 3. Monetization Score (35% weight)
- How clear is the path to revenue?
- Can it charge from day 1?
- Is the pricing model proven?

**8-10:** Clear B2B SaaS, proven models
**5-7:** Emerging models, uncertain pricing
**1-4:** Ad-supported, requires scale

### 4. Competition Score (10% weight)
- How favorable is the competitive landscape?
- Can you differentiate easily?
- Is the market saturated?

**8-10:** Low competition, clear differentiation
**5-7:** Moderate competition, some differentiation
**1-4:** Highly saturated, hard to stand out

### 5. Risk Score (10% weight)
- How risky is this venture?
- Regulatory hurdles?
- Market timing issues?

**8-10:** Low risk, stable market
**5-7:** Moderate risk, some unknowns
**1-4:** High risk, many uncertainties

### Overall Score Formula

```
Overall = (Feasibility × 0.15) +
          (Market Demand × 0.30) +
          (Monetization × 0.35) +
          (Competition × 0.10) +
          (Risk × 0.10)
```

**Interpretation:**
- **8.5-10.0:** Excellent opportunity, act fast
- **7.0-8.4:** Strong opportunity, worth pursuing
- **5.5-6.9:** Decent opportunity, needs validation
- **Below 5.5:** Risky, requires significant work

---

## Filtering Ideas

### By Channel
- **Strategic:** VC-backed, long-term opportunities
- **Quick-Win:** Fast-to-build, bootstrap-friendly

### By Category
Common categories:
- SaaS
- DevTools
- FinTech
- HealthTech
- AI/ML
- Marketplace
- Productivity
- Content

### By Minimum Score
Filter ideas by minimum overall score (e.g., only show ideas scoring 7.5+)

---

## Managing Ideas

### Favoriting Ideas
Click the ⭐ button on any idea to mark it as a favorite.

Use this to:
- Build a shortlist of ideas to pursue
- Track ideas you're researching
- Share with team members (future feature)

### Idea Status
Each idea has a status:
- **New:** Just generated, not reviewed yet
- **Validated:** You've done market research
- **In Progress:** Currently building
- **Launched:** Live in production
- **Archived:** No longer pursuing

Change status via the API:
```bash
curl -X PATCH http://localhost:8000/api/ideas/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "validated"}'
```

### Adding Notes
Add personal notes to ideas (requires API call currently):

```bash
curl -X PATCH http://localhost:8000/api/ideas/1 \
  -H "Content-Type: application/json" \
  -d '{"notes": "Validated with 10 potential customers. Interest is strong."}'
```

---

## Running Scans

### Manual Scans
Click "Run Scan Now" on the dashboard to trigger an immediate scan.

**Scan Process (1-3 minutes):**
1. Scrapes YC RFS and A16Z blog
2. Fetches Product Hunt trending products
3. Analyzes Google Trends
4. Generates ideas using Claude AI
5. Filters and scores ideas
6. Saves to database

### Scheduled Scans

**Daily Scan (default: 9 AM)**
- Keeps you updated on new opportunities
- Tracks emerging trends
- Costs ~$0.50-2.00 per scan

**Weekly Report (default: Friday 5 PM)**
- Comprehensive analysis
- Top 5 ideas of the week
- Trend insights

**Configure in `config/.env`:**
```env
DAILY_SCAN_TIME=09:00
WEEKLY_REPORT_DAY=friday
WEEKLY_REPORT_TIME=17:00
```

### Disabling Scheduled Scans
To run scans only manually:
```env
ENABLE_SCHEDULED_SCANS=false
```

---

## API Usage

### Authentication
Currently no authentication required (add this in production!)

### Base URL
```
http://localhost:8000/api
```

### Common Endpoints

**List Ideas:**
```bash
GET /api/ideas?channel=quick-win&min_score=7.5&limit=20
```

**Get Idea Details:**
```bash
GET /api/ideas/1
```

**Trigger Scan:**
```bash
POST /api/scan/now
```

**Get Trends:**
```bash
GET /api/trends?limit=50&min_momentum=70
```

**Get Statistics:**
```bash
GET /api/stats
```

**Get Strategic Opportunities:**
```bash
GET /api/opportunities/strategic?limit=10
```

**Get Quick-Win Opportunities:**
```bash
GET /api/opportunities/quick-wins?limit=10
```

### Response Format
All endpoints return JSON:
```json
{
  "count": 10,
  "ideas": [
    {
      "id": 1,
      "title": "AI-Powered Code Review Tool",
      "description": "...",
      "overall_score": 8.5,
      "channel": "quick-win"
    }
  ]
}
```

### Full API Docs
Interactive API documentation: http://localhost:8000/docs

---

## Advanced Configuration

### Scan Settings

**Ideas Per Scan:**
```env
IDEAS_PER_SCAN=10  # Total ideas to generate
MAX_IDEAS_PER_CHANNEL=5  # Per channel (strategic + quick-win)
```

**Quality Filters:**
```env
MIN_FEASIBILITY_SCORE=6.0  # Minimum feasibility required
MIN_MONETIZATION_SCORE=7.0  # Minimum monetization required
```

### Data Source Toggles

Enable/disable specific data sources:
```env
ENABLE_YC_SCRAPER=true
ENABLE_A16Z_SCRAPER=true
ENABLE_PRODUCT_HUNT=true
ENABLE_GOOGLE_TRENDS=true
```

### Product Hunt API

For better Product Hunt data, get an API key:
1. Visit https://api.producthunt.com/v2/oauth/applications
2. Create an application
3. Add key to `.env`:
```env
PRODUCT_HUNT_API_KEY=your_key_here
```

### Telegram Integration

Configure Telegram for automatic notifications:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_USER_ID=your_user_id
ENABLE_TELEGRAM=true
```

You'll receive:
- Daily summaries with top ideas
- Weekly reports with insights
- Scan completion notifications

---

## Best Practices

### 1. Start with Manual Scans
Run a few manual scans to understand the output before enabling scheduled scans.

### 2. Adjust Filters
If you're getting too many/few ideas, adjust:
- `MIN_FEASIBILITY_SCORE`
- `MIN_MONETIZATION_SCORE`
- `IDEAS_PER_SCAN`

### 3. Focus on Quick Wins First
Quick-win ideas are faster to validate and monetize. Build these first to generate cash flow.

### 4. Validate Before Building
ShapeX generates ideas, but YOU need to validate:
- Talk to potential customers
- Search Reddit, Twitter for pain points
- Check if people are already paying for solutions
- Build a landing page and test demand

### 5. Track Your Favorites
Use the favorite feature to build a shortlist. Focus on 2-3 ideas max at a time.

### 6. Review Competitors
Always research the competitors listed. See what they're missing and how you can differentiate.

### 7. Check Trends Regularly
Visit the Trends page weekly to spot emerging opportunities before they're saturated.

---

## Tips for Finding the Best Ideas

1. **Look for high monetization scores** - These can charge customers from day 1
2. **Cross-reference with trends** - Ideas matching trending keywords have tailwinds
3. **Favor quick-wins early** - Build 2-4 week projects to learn and earn
4. **Strategic ideas need capital** - Don't pursue without funding or significant runway
5. **Check "Time to Build"** - Start with 2-4 week projects
6. **Read the AI reasoning** - Claude explains WHY each idea is good
7. **Focus on B2B SaaS** - Easier to monetize than consumer products

---

## Troubleshooting

### Scans are slow
- Reduce `IDEAS_PER_SCAN` to 5
- Disable some data sources you don't need

### Ideas are too similar
- Run scans less frequently (trends change slowly)
- Clear old ideas from database occasionally

### Scores seem off
- Claude's scoring is subjective but consistent
- Use it for relative comparison, not absolute truth
- Adjust weight formula in `analyzers/idea_generator.py` if needed

### Want more ideas per scan
- Increase `MAX_IDEAS_PER_CHANNEL` to 10
- Warning: Higher Claude API costs

---

Need help? Check `logs/shapex.log` for detailed error messages!
