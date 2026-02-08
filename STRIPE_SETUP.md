# Stripe Billing Setup Guide

Complete setup guide for integrating Stripe payments with ShapeX Market Intelligence.

---

## Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Start now" (or "Sign in" if you have an account)
3. Complete registration with email and password
4. You'll start in **Test Mode** (perfect for development)

---

## Step 2: Get API Keys

1. Navigate to **Developers** → **API keys** in Stripe Dashboard
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_...`) - Not needed for backend-only
   - **Secret key** (starts with `sk_test_...`) - **KEEP THIS SECRET!**

3. Add to `shapex/config/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_51ABC123...your_key_here
   ```

---

## Step 3: Create Products and Prices

### Create Indie Tier Product

1. Go to **Products** → **Add Product**
2. Fill in:
   - **Name**: ShapeX Indie
   - **Description**: 100 API requests per month
   - **Pricing**:
     - Price: $29.00
     - Billing period: Monthly
     - Currency: USD
3. Click "Save product"
4. Copy the **Price ID** (starts with `price_...`)
5. Add to `.env`:
   ```env
   STRIPE_PRICE_INDIE=price_1ABC123...
   ```

### Create Pro Tier Product

1. Go to **Products** → **Add Product**
2. Fill in:
   - **Name**: ShapeX Pro
   - **Description**: 1,000 API requests per month
   - **Pricing**:
     - Price: $99.00
     - Billing period: Monthly
     - Currency: USD
3. Click "Save product"
4. Copy the **Price ID**
5. Add to `.env`:
   ```env
   STRIPE_PRICE_PRO=price_1DEF456...
   ```

### Create VC Tier Product

1. Go to **Products** → **Add Product**
2. Fill in:
   - **Name**: ShapeX VC
   - **Description**: 10,000 API requests per month
   - **Pricing**:
     - Price: $499.00
     - Billing period: Monthly
     - Currency: USD
3. Click "Save product"
4. Copy the **Price ID**
5. Add to `.env`:
   ```env
   STRIPE_PRICE_VC=price_1GHI789...
   ```

---

## Step 4: Configure Webhook

Webhooks allow Stripe to notify your backend when subscription events occur (payment succeeded, subscription canceled, etc.)

### Development Setup (Stripe CLI)

**Best for local testing:**

1. **Install Stripe CLI**:
   - Windows: `scoop install stripe`
   - Mac: `brew install stripe/stripe-cli/stripe`
   - Or download from https://stripe.com/docs/stripe-cli

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhook events to localhost**:
   ```bash
   stripe listen --forward-to localhost:8000/api/billing/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_...`)
   ```bash
   # Output will show:
   # > Ready! Your webhook signing secret is whsec_abc123...
   ```

5. **Add to `.env`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_abc123...
   ```

6. **Keep the Stripe CLI running** in a separate terminal while testing

### Production Setup (After Deployment)

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click "Add endpoint"
3. Fill in:
   - **Endpoint URL**: `https://api.shapex.com/api/billing/webhook`
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Click "Add endpoint"
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Update production `.env` with the secret

---

## Step 5: Test Stripe Integration

### 5.1 Install Stripe SDK

```bash
cd shapex/backend
pip install stripe==8.0.0
```

### 5.2 Start Backend

```bash
# Terminal 1: Start backend
cd shapex/backend
python main.py
```

### 5.3 Start Stripe CLI (for webhook testing)

```bash
# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:8000/api/billing/webhook
```

### 5.4 Test Checkout Flow

```bash
# Terminal 3: Run test script
cd shapex
python test_stripe.py
```

---

## Test Credit Cards

Stripe provides test cards for testing payments:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**Test card details**:
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

---

## Step 6: Test Subscription Lifecycle

### 6.1 Create Subscription

```bash
curl -X POST http://localhost:8000/api/billing/create-checkout \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "indie",
    "success_url": "http://localhost:3001/success",
    "cancel_url": "http://localhost:3001/pricing"
  }'
```

Expected response:
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "session_id": "cs_test_abc123..."
}
```

### 6.2 Complete Checkout

1. Open the `checkout_url` in a browser
2. Enter test card: `4242 4242 4242 4242`
3. Fill in:
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
4. Click "Subscribe"

### 6.3 Verify Webhook Events

Check Terminal 2 (Stripe CLI) for events:
```
✓ checkout.session.completed
✓ customer.subscription.created
✓ invoice.payment_succeeded
```

### 6.4 Check Subscription Status

```bash
curl -X GET http://localhost:8000/api/billing/subscription \
  -H "X-API-Key: YOUR_API_KEY"
```

Expected response:
```json
{
  "tier": "indie",
  "status": "active",
  "subscription": {
    "id": 1,
    "stripe_subscription_id": "sub_abc123...",
    "current_period_start": "2026-02-07T00:00:00",
    "current_period_end": "2026-03-07T00:00:00",
    "cancel_at_period_end": false
  }
}
```

### 6.5 Access Billing Portal

```bash
curl -X POST http://localhost:8000/api/billing/portal \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"return_url": "http://localhost:3001/dashboard"}'
```

Expected response:
```json
{
  "portal_url": "https://billing.stripe.com/p/session/test_..."
}
```

Open `portal_url` to manage subscription (cancel, update payment method, view invoices)

---

## Step 7: Verify User Tier Upgrade

### 7.1 Check User Info

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "X-API-Key: YOUR_API_KEY"
```

Expected response (after successful subscription):
```json
{
  "user": {
    "tier": "indie",  // ← Changed from "free"
    ...
  },
  "usage": {
    "requests_this_month": 5,
    "tier_limit": 100,  // ← Increased from 10
    "remaining": 95
  }
}
```

### 7.2 Test Increased Rate Limit

Make 20 API calls (should not hit limit with Indie tier):

```bash
for i in {1..20}; do
  curl -X GET http://localhost:8000/api/ideas \
    -H "X-API-Key: YOUR_API_KEY"
  echo "Request $i completed"
done
```

With Free tier, you'd hit limit at request 10. With Indie tier, all 20 should succeed.

---

## Troubleshooting

### Issue: "Stripe price ID not configured"

**Solution**: Make sure all 3 price IDs are in `.env`:
```env
STRIPE_PRICE_INDIE=price_1ABC...
STRIPE_PRICE_PRO=price_1DEF...
STRIPE_PRICE_VC=price_1GHI...
```

### Issue: "Invalid signature" on webhook

**Solution**:
1. Check `STRIPE_WEBHOOK_SECRET` is in `.env`
2. Make sure Stripe CLI is running: `stripe listen --forward-to localhost:8000/api/billing/webhook`
3. Copy the webhook secret from Stripe CLI output

### Issue: Subscription created but tier not upgraded

**Solution**:
1. Check webhook events in Stripe CLI output
2. Verify `checkout.session.completed` event was received
3. Check backend logs for errors
4. Manually check database: `SELECT * FROM subscriptions;`

### Issue: Test card declined

**Solution**:
- Use `4242 4242 4242 4242` (always succeeds)
- If still failing, check Stripe Dashboard → Logs for details

---

## Production Checklist

Before going live with real money:

- [ ] Switch from Test Mode to Live Mode in Stripe Dashboard
- [ ] Get **Live API keys** (start with `sk_live_...`)
- [ ] Create **Live products and prices**
- [ ] Configure **Live webhook endpoint** (not Stripe CLI)
- [ ] Update `.env` with live keys
- [ ] Test with **real credit card** (your own, then refund)
- [ ] Set up **webhook monitoring** in Stripe Dashboard
- [ ] Enable **fraud detection** in Stripe Dashboard
- [ ] Review **tax settings** (Stripe Tax or TaxJar)
- [ ] Set up **email receipts** in Stripe Dashboard

---

## Stripe Dashboard Overview

Key sections you'll use:

- **Home**: Overview of revenue, subscriptions
- **Payments**: All payment transactions
- **Subscriptions**: Active subscriptions
- **Customers**: Customer list
- **Products**: Your pricing tiers
- **Developers → API keys**: Get keys
- **Developers → Webhooks**: Configure webhooks
- **Developers → Logs**: Debug webhook issues

---

## Cost Estimate

Stripe pricing:
- **2.9% + $0.30** per successful transaction
- **No monthly fees** (free account)

Example costs:
- Indie tier ($29/mo): Stripe fee = $1.14/transaction
- Pro tier ($99/mo): Stripe fee = $3.17/transaction
- VC tier ($499/mo): Stripe fee = $14.80/transaction

**Monthly Stripe costs** (at 50 paid users):
- 20 Indie × $1.14 = $22.80
- 20 Pro × $3.17 = $63.40
- 10 VC × $14.80 = $148.00
- **Total**: ~$234/month in Stripe fees

---

## Next Steps

After Stripe is working:

1. ✅ Test checkout flow
2. ✅ Test webhook events
3. ✅ Verify tier upgrades
4. ⏳ Build landing page (Task #5)
5. ⏳ Add email notifications (Task #4)
6. ⏳ Deploy to production (Task #7)

---

**Questions?** Check Stripe docs: https://stripe.com/docs
**Need help?** Run `python test_stripe.py` to diagnose issues
