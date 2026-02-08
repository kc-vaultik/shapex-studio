# ShapeX Market Intelligence - Quick Start

**Transform ShapeX into a Revenue-Generating SaaS in 3 Days**

---

## 🎯 What's Been Built (3/7 Tasks Complete)

### ✅ Task #1: API Authentication (Complete)
- User registration system
- Secure API key generation
- User management endpoints

### ✅ Task #2: Rate Limiting (Complete)
- Tier-based rate limits (Free: 10, Indie: 100, Pro: 1K, VC: 10K/month)
- Usage tracking per user
- Protected API endpoints

### ✅ Task #3: Stripe Billing (Complete)
- Checkout flow integration
- Billing portal for subscription management
- Webhook handling for subscription lifecycle
- Automatic tier upgrades

**Progress**: 43% (3/7 tasks) | **Time Invested**: ~5 hours | **Time Remaining**: ~9 hours

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.9+
- Anthropic API key
- Stripe account (free to create)

### 1. Install Dependencies

```bash
cd shapex/backend
pip install -r requirements.txt
```

### 2. Configure Environment

Edit `config/.env`:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-your_key_here

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
STRIPE_PRICE_INDIE=price_your_indie_id
STRIPE_PRICE_PRO=price_your_pro_id
STRIPE_PRICE_VC=price_your_vc_id
```

**See STRIPE_SETUP.md for detailed Stripe configuration**

### 3. Initialize Database

```bash
cd shapex/backend
python -c "from app.models.database import init_db; init_db()"
```

### 4. Start Backend

```bash
# Terminal 1: Backend
cd shapex/backend
python main.py
```

### 5. Start Stripe Webhooks (Development)

```bash
# Terminal 2: Stripe CLI
stripe listen --forward-to localhost:8000/api/billing/webhook
```

### 6. Test Authentication

```bash
# Terminal 3: Tests
cd shapex
python test_auth.py
```

### 7. Test Stripe Billing

```bash
python test_stripe.py
```

---

## 📊 Current Pricing Tiers

| Tier | Rate Limit | Price | Features |
|------|-----------|-------|----------|
| **Free** | 10 requests total | $0 | Basic API access, 10 sample ideas |
| **Indie** | 100 req/month | $29/mo | Full API access, weekly newsletter |
| **Pro** | 1,000 req/month | $99/mo | Priority support, daily ideas |
| **VC** | 10,000 req/month | $499/mo | Custom integrations, white-label |

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get user info
- `GET /api/auth/keys` - List API keys
- `POST /api/auth/keys` - Create new API key
- `DELETE /api/auth/keys/{id}` - Revoke API key

### Billing
- `POST /api/billing/create-checkout` - Create Stripe checkout session
- `POST /api/billing/portal` - Access billing portal
- `GET /api/billing/subscription` - Get subscription status
- `POST /api/billing/webhook` - Stripe webhook handler

### Ideas (Protected)
- `GET /api/ideas` - List all ideas (requires X-API-Key)
- `GET /api/ideas/{id}` - Get idea details (requires X-API-Key)
- `GET /api/opportunities/strategic` - Strategic opportunities
- `GET /api/opportunities/quick-wins` - Quick win ideas

### Analytics (Protected)
- `GET /api/trends` - Market trends
- `GET /api/stats` - ShapeX statistics

### Health
- `GET /` - Service info
- `GET /api/health` - Health check

---

## 🧪 Testing Workflow

### 1. Test Authentication
```bash
python test_auth.py
```

**Expected:**
- ✓ User registration
- ✓ API key generation
- ✓ Protected endpoint access
- ✓ Rate limiting enforcement

### 2. Test Stripe Billing
```bash
# Make sure Stripe CLI is running first!
# stripe listen --forward-to localhost:8000/api/billing/webhook

python test_stripe.py
```

**Expected:**
- ✓ Checkout session creation
- ✓ Payment processing (test card: 4242 4242 4242 4242)
- ✓ Webhook events received
- ✓ User tier upgrade
- ✓ Rate limit increase

### 3. Manual API Testing

```bash
# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","full_name":"Test User"}'

# Save the API key from response

# Get ideas
curl -X GET http://localhost:8000/api/ideas \
  -H "X-API-Key: YOUR_API_KEY_HERE"

# Create checkout
curl -X POST http://localhost:8000/api/billing/create-checkout \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"tier":"indie"}'

# Open checkout URL in browser to complete payment
```

---

## 📝 Next Steps (4 Tasks Remaining)

### Task #4: Email Newsletter (2 hours)
- Integrate SendGrid or Mailchimp
- Weekly digest email template
- Subscribe/unsubscribe endpoints

### Task #5: Landing Page (4 hours) - **HIGH PRIORITY**
- Hero section with value proposition
- Pricing table
- Sample ideas showcase
- Sign-up flow

### Task #6: API Documentation (2 hours)
- Code examples (Python, JS, cURL)
- Rate limit documentation
- Troubleshooting guide

### Task #7: Deploy to Production (3 hours)
- Deploy backend to Railway/Render
- Deploy landing page to Vercel
- Configure production Stripe webhooks
- Set up monitoring

---

## 💰 Revenue Projections

**Conservative (Month 3)**:
- 50 Indie × $29 = $1,450/mo
- 30 Pro × $99 = $2,970/mo
- 2 VC × $499 = $998/mo
- **Total**: $5,418 MRR

**Optimistic (Month 3)**:
- 100 Indie × $29 = $2,900/mo
- 50 Pro × $99 = $4,950/mo
- 5 VC × $499 = $2,495/mo
- **Total**: $10,345 MRR

**Costs**: ~$200-500/mo (AI APIs, Stripe fees, hosting)

**Net Profit**: $5,000-9,800/mo

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is available
netstat -ano | findstr :8000

# Reinstall dependencies
pip install -r backend/requirements.txt
```

### Authentication failing
```bash
# Reinitialize database
cd backend
python -c "from app.models.database import init_db; init_db()"
```

### Stripe webhook not working
```bash
# Make sure Stripe CLI is running
stripe listen --forward-to localhost:8000/api/billing/webhook

# Check webhook secret in .env
echo $STRIPE_WEBHOOK_SECRET
```

### Rate limiting not working
```bash
# Check API usage table
sqlite3 data/shapex.db "SELECT * FROM api_usage;"
```

---

## 📚 Documentation

- **STRIPE_SETUP.md** - Complete Stripe configuration guide
- **MONETIZATION_PROGRESS.md** - Detailed progress tracker
- **test_auth.py** - Authentication test script
- **test_stripe.py** - Billing integration test script

---

## 🎓 Learning Resources

### Stripe
- [Stripe Dashboard](https://dashboard.stripe.com/test)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Testing Cards](https://stripe.com/docs/testing)

### FastAPI
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Pydantic Models](https://docs.pydantic.dev/)

### SQLAlchemy
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/orm/)

---

## 🚀 Recommended Next Action

**Option 1: Test What's Built (Recommended)**
```bash
# Start backend
cd shapex/backend
python main.py

# In new terminal: Test Stripe
cd shapex
python test_stripe.py
```

**Option 2: Continue Building**
Say to Claude Code: **"Continue with Task #5 - build landing page"**

**Option 3: Deploy MVP Now**
Say to Claude Code: **"Deploy what we have so far to production"**

---

## 💬 Support

**Issues?** Check the logs:
```bash
tail -f logs/shapex.log
```

**Questions?**
- Review STRIPE_SETUP.md for Stripe issues
- Check API docs at http://localhost:8000/docs
- Run test scripts for diagnostics

---

**Last Updated**: Feb 7, 2026 1:00 AM
**Status**: 3/7 tasks complete (43%)
**Next Milestone**: Landing page + deployment
