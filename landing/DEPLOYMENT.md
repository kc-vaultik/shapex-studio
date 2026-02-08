# ShapeX Landing Page Deployment Guide

Complete guide for deploying the ShapeX landing page to production.

---

## Quick Deploy

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd C:\Users\kacnf\shapex\landing
vercel --prod
```

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd C:\Users\kacnf\shapex\landing
netlify deploy --prod --dir=dist
```

---

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Update `.env.production` with production API URL
- [ ] Add Stripe publishable key (production)
- [ ] Configure analytics IDs (optional)
- [ ] Review feature flags

### 2. Backend Configuration
- [ ] ShapeX backend deployed and running
- [ ] API endpoints accessible at production URL
- [ ] CORS configured to allow landing page domain
- [ ] Stripe webhooks configured with production URL
- [ ] Database initialized with production data

### 3. Build Testing
```bash
# Test production build locally
npm run build
npm run preview

# Check bundle size
du -sh dist
```

### 4. Content Review
- [ ] All copy matches approved marketing copy
- [ ] Pricing tiers match Stripe products
- [ ] Links and CTAs point to correct URLs
- [ ] Social media links updated
- [ ] Privacy policy and terms of service linked

### 5. Performance Optimization
- [ ] Images optimized (WebP format)
- [ ] Lazy loading enabled for images
- [ ] Code splitting configured
- [ ] Bundle size < 500KB gzipped
- [ ] Lighthouse score > 90

---

## Vercel Deployment (Detailed)

### Initial Setup

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Link Project**
```bash
cd C:\Users\kacnf\shapex\landing
vercel link
```
Select or create a new project when prompted.

### Configure Environment Variables

**Option A: Via CLI**
```bash
vercel env add VITE_API_URL production
# Enter: https://api.shapex.com/api

vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Enter: pk_live_your_key_here
```

**Option B: Via Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable with scope: Production

### Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or deploy with specific branch
vercel --prod --name shapex-landing
```

### Custom Domain Setup

1. **Add Domain in Vercel Dashboard**
   - Project Settings → Domains
   - Add domain: `shapex.com` or `www.shapex.com`

2. **Configure DNS**

   **Option A: Using Vercel Nameservers (Recommended)**
   - Update nameservers at your domain registrar
   - Vercel provides: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`

   **Option B: Using A/CNAME Records**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Enable HTTPS**
   - Automatic with Vercel (Let's Encrypt)
   - SSL certificate provisioned within 24 hours

### Post-Deployment Verification

```bash
# Test production URL
curl -I https://shapex.com

# Check API connectivity
curl https://shapex.com/api/health

# Verify environment variables
vercel env pull
cat .env.local
```

---

## Netlify Deployment (Detailed)

### Initial Setup

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**
```bash
netlify login
```

3. **Initialize Site**
```bash
cd C:\Users\kacnf\shapex\landing
netlify init
```

### Configure Build Settings

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Configure Environment Variables

**Via CLI:**
```bash
netlify env:set VITE_API_URL "https://api.shapex.com/api"
netlify env:set VITE_STRIPE_PUBLISHABLE_KEY "pk_live_your_key_here"
```

**Via Dashboard:**
1. Go to https://app.netlify.com
2. Site Settings → Environment Variables
3. Add each variable

### Deploy to Production

```bash
# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Or use continuous deployment
git push origin main  # Netlify auto-deploys from main branch
```

### Custom Domain Setup

1. **Add Domain in Netlify Dashboard**
   - Domain Settings → Add custom domain
   - Enter: `shapex.com`

2. **Configure DNS**

   **Option A: Netlify DNS**
   - Transfer DNS management to Netlify
   - Follow dashboard instructions

   **Option B: External DNS**
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

3. **Enable HTTPS**
   - Domain Settings → HTTPS
   - Provision certificate (automatic)

---

## Backend CORS Configuration

Update ShapeX backend to allow landing page domain:

```python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",  # Local development
        "https://shapex.com",      # Production
        "https://www.shapex.com"   # Production with www
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## DNS Configuration

### Primary Domain (shapex.com)

**Recommended Setup:**
```
Type: A
Name: @
Value: [Vercel/Netlify IP]

Type: CNAME
Name: www
Value: [Vercel/Netlify CNAME]

Type: CNAME
Name: api
Value: [Backend server domain]
```

### SSL Certificate

Both Vercel and Netlify provide free SSL certificates via Let's Encrypt:
- Automatic provisioning
- Auto-renewal every 90 days
- No manual configuration needed

---

## Performance Optimization

### 1. Build Optimization

```bash
# Analyze bundle size
npm run build -- --mode production
npx vite-bundle-visualizer
```

### 2. Image Optimization

```bash
# Convert images to WebP
npm install -g sharp-cli
sharp -i src/assets/*.{jpg,png} -o dist/assets -f webp
```

### 3. Code Splitting

Vite automatically splits code. Verify with:
```bash
ls -lh dist/assets/*.js
```

### 4. Compression

Enable Gzip/Brotli compression:

**Vercel:** Automatic
**Netlify:** Automatic

### 5. Caching Strategy

Configured in `vercel.json` / `netlify.toml`:
- Static assets: 1 year cache
- HTML: No cache (always fresh)
- API calls: No cache

---

## Monitoring and Analytics

### 1. Vercel Analytics

```bash
# Enable in dashboard
# Project Settings → Analytics → Enable
```

### 2. Google Analytics

Add to `.env.production`:
```
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

Create `src/utils/analytics.ts`:
```typescript
export const initAnalytics = () => {
  const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
  if (!GA_ID) return;

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_ID);
};
```

### 3. Error Tracking (Sentry)

```bash
npm install @sentry/react @sentry/vite-plugin
```

Update `vite.config.ts`:
```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default {
  plugins: [
    sentryVitePlugin({
      org: 'shapex',
      project: 'landing-page',
    }),
  ],
};
```

---

## CI/CD Pipeline

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Vercel Git Integration

Automatic deployment on push:
1. Link GitHub repository in Vercel dashboard
2. Configure production branch: `main`
3. Push to `main` → automatic deployment

---

## Troubleshooting

### Build Fails

**Error: Module not found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: Out of memory**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Deployment Fails

**Vercel: Function Execution Timeout**
- Check build logs: `vercel logs`
- Increase timeout in `vercel.json`: `"maxDuration": 60`

**Netlify: Deploy Failed**
- Check build logs in dashboard
- Verify `netlify.toml` configuration

### API Connection Issues

**CORS errors in browser console:**
```bash
# Update backend CORS configuration
# Add landing page domain to allow_origins
```

**API not reachable:**
```bash
# Verify backend is running
curl https://api.shapex.com/health

# Check DNS records
nslookup api.shapex.com
```

### SSL Certificate Issues

**Certificate not provisioning:**
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct
- Check domain verification in dashboard

**Mixed content warnings:**
- Ensure all assets use HTTPS URLs
- Update API URL to HTTPS in .env.production

---

## Rollback Procedures

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Netlify Rollback

```bash
# List deployments
netlify deploys:list

# Rollback to specific deployment
netlify rollback [deploy-id]
```

---

## Post-Launch Checklist

- [ ] Production URL accessible (https://shapex.com)
- [ ] All pages load correctly
- [ ] API integration working (ideas, stats)
- [ ] Stripe checkout flow functional
- [ ] Analytics tracking events
- [ ] SSL certificate valid
- [ ] Mobile responsive
- [ ] SEO meta tags present
- [ ] Social media previews working
- [ ] Contact form submitting
- [ ] Newsletter signup working
- [ ] 404 page configured
- [ ] Sitemap generated
- [ ] robots.txt configured

---

## Maintenance

### Regular Updates

```bash
# Update dependencies monthly
npm update
npm audit fix

# Rebuild and redeploy
npm run build
vercel --prod
```

### Monitoring

- Check Vercel/Netlify analytics weekly
- Review error logs daily
- Monitor API response times
- Track conversion rates
- Review user feedback

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs

For ShapeX-specific issues, contact: support@shapex.com
