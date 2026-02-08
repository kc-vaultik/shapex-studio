# ShapeX - Quick Start Guide

Get ShapeX up and running in 10 minutes.

## Prerequisites

- Python 3.9+ installed
- Node.js 16+ installed
- Anthropic Claude API key ([Get one here](https://console.anthropic.com/))

## Step 1: Configure Environment

```bash
cd shapex
cp config\.env.example config\.env
```

Edit `config\.env` and add your API keys:

```env
ANTHROPIC_API_KEY=your_actual_api_key_here
```

**Important:** You MUST add your Anthropic API key, or idea generation won't work!

Optional: Add your Telegram credentials for notifications (see your existing `telegram-claude-agent` project for these):

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_USER_ID=your_telegram_user_id
```

## Step 2: Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Initialize the database:

```bash
python -c "from app.models.database import init_db; init_db()"
```

## Step 3: Setup Frontend

Open a new terminal:

```bash
cd shapex\frontend
npm install
```

## Step 4: Run ShapeX

### Terminal 1 - Backend:
```bash
cd shapex\backend
venv\Scripts\activate
python main.py
```

### Terminal 2 - Frontend:
```bash
cd shapex\frontend
npm start
```

## Step 5: Access Dashboard

Open your browser and visit:
- **Dashboard:** http://localhost:3001
- **API Docs:** http://localhost:8000/docs

## Step 6: Generate Your First Ideas

1. Click **"Run Scan Now"** on the dashboard
2. Wait 1-2 minutes for the scan to complete
3. View generated startup ideas!

## What Happens During a Scan?

ShapeX will:
1. Scrape YC RFS and A16Z blog (strategic opportunities)
2. Fetch Product Hunt trending products (quick-win ideas)
3. Analyze Google Trends for market momentum
4. Use Claude AI to generate 10 scored startup ideas
5. Display results on the dashboard

## Scheduled Scans

By default, ShapeX runs:
- **Daily scan:** 9:00 AM
- **Weekly report:** Friday 5:00 PM

To disable scheduled scans, set in `config\.env`:
```env
ENABLE_SCHEDULED_SCANS=false
```

## Telegram Notifications

If you configured Telegram, you'll receive:
- Daily summaries at 9 AM
- Weekly reports on Friday at 5 PM
- Top ideas automatically

## Troubleshooting

### "ANTHROPIC_API_KEY not found"
- Make sure you edited `config\.env` with your real API key
- The `.env` file must be in the `config/` directory

### "Module not found" errors
- Make sure you activated the virtual environment: `venv\Scripts\activate`
- Reinstall dependencies: `pip install -r requirements.txt`

### Database errors
- Delete `data\shapex.db` and re-run: `python -c "from app.models.database import init_db; init_db()"`

### Frontend won't start
- Make sure backend is running first on port 8000
- Check `npm install` completed without errors

## Next Steps

- **Explore ideas:** Visit http://localhost:3001/ideas
- **View trends:** Check http://localhost:3001/trends
- **API access:** Use http://localhost:8000/api for programmatic access
- **Customize settings:** Edit `config\.env` to change scan times, filters, etc.

## API Endpoints

- `GET /api/ideas` - List all ideas
- `GET /api/ideas/{id}` - Get idea details
- `POST /api/scan/now` - Trigger manual scan
- `GET /api/trends` - Get market trends
- `GET /api/stats` - Get statistics
- `GET /api/opportunities/strategic` - Top VC-backed ideas
- `GET /api/opportunities/quick-wins` - Top quick-win ideas

Full API documentation: http://localhost:8000/docs

## Cost Estimates

- **Anthropic Claude API:** ~$0.50-2.00 per scan (depends on amount of data)
- **Daily scans:** ~$15-60/month
- **On-demand only:** ~$5-20/month

To reduce costs:
- Reduce `IDEAS_PER_SCAN` in `.env`
- Disable scheduled scans
- Run scans manually only when needed

## Support

Check `logs/shapex.log` for detailed error messages.

Happy idea hunting! 🚀
