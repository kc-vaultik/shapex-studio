# API Integration Guide

Complete guide for integrating the ShapeX landing page with the backend API.

---

## Overview

The landing page connects to the ShapeX backend API to:
1. Display real-time top venture ideas (Sample Ideas section)
2. Show live platform statistics (Hero section stats)
3. Handle user registration and Stripe checkout
4. Manage billing portal access

---

## API Utilities

### Location: `src/utils/api.ts`

This file contains all API interaction functions and TypeScript interfaces.

### Available Functions

#### `fetchIdeas(limit?: number): Promise<Idea[]>`
Fetches top-scored venture ideas from ShapeX backend.

**Parameters:**
- `limit` (optional): Number of ideas to fetch (default: 5)

**Returns:** Array of `Idea` objects

**Example:**
```typescript
import { fetchIdeas } from '@/utils/api';

const ideas = await fetchIdeas(10);
console.log(ideas);
// [
//   {
//     id: 1,
//     title: "AI-Powered Code Review",
//     description: "...",
//     overall_score: 8.5,
//     ...
//   }
// ]
```

#### `fetchStats(): Promise<Stats | null>`
Fetches platform statistics (total ideas, categories, data sources, etc.)

**Returns:** `Stats` object or `null` if error

**Example:**
```typescript
import { fetchStats } from '@/utils/api';

const stats = await fetchStats();
console.log(stats);
// {
//   total_ideas: 10523,
//   ideas_today: 47,
//   avg_score: 7.8,
//   top_categories: ["SaaS", "FinTech", "HealthTech"],
//   data_sources: 50,
//   scanning_status: "active"
// }
```

#### `registerUser(email: string, tier: string): Promise<any>`
Registers a new user with specified tier.

**Parameters:**
- `email`: User email address
- `tier`: Subscription tier ("free", "indie", "pro", "vc")

**Returns:** User object with API key

**Example:**
```typescript
import { registerUser } from '@/utils/api';

const user = await registerUser('user@example.com', 'indie');
console.log(user);
// {
//   user_id: 123,
//   email: "user@example.com",
//   api_key: "sk_live_abc123...",
//   tier: "indie"
// }
```

#### `createCheckoutSession(data: CheckoutData): Promise<any>`
Creates a Stripe checkout session for tier upgrades.

**Parameters:**
- `data.email`: User email
- `data.tier`: Target tier ("indie", "pro", "vc")
- `data.success_url` (optional): Redirect after success
- `data.cancel_url` (optional): Redirect after cancel

**Returns:** Checkout session with URL

**Example:**
```typescript
import { createCheckoutSession } from '@/utils/api';

const session = await createCheckoutSession({
  email: 'user@example.com',
  tier: 'pro',
  success_url: window.location.origin + '/success',
  cancel_url: window.location.origin + '/pricing'
});

// Redirect to Stripe checkout
window.location.href = session.url;
```

#### `createBillingPortalSession(customerId: string): Promise<any>`
Creates a Stripe billing portal session for subscription management.

**Parameters:**
- `customerId`: Stripe customer ID

**Returns:** Portal session with URL

**Example:**
```typescript
import { createBillingPortalSession } from '@/utils/api';

const portal = await createBillingPortalSession('cus_abc123');
window.location.href = portal.url;
```

---

## Custom Hooks

### `useIdeas` Hook

**Location:** `src/hooks/useIdeas.ts`

React hook for fetching and managing venture ideas with loading and error states.

**Usage:**
```typescript
import { useIdeas } from '@/hooks/useIdeas';

function SampleIdeas() {
  const { ideas, loading, error, refetch } = useIdeas(5);

  if (loading) return <div>Loading ideas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {ideas.map(idea => (
        <div key={idea.id}>
          <h3>{idea.title}</h3>
          <p>{idea.description}</p>
          <span>Score: {idea.overall_score}</span>
        </div>
      ))}
      <button onClick={refetch}>Refresh Ideas</button>
    </div>
  );
}
```

**Parameters:**
- `limit` (optional): Number of ideas to fetch (default: 5)

**Returns:**
- `ideas`: Array of `Idea` objects
- `loading`: Boolean loading state
- `error`: Error message string or null
- `refetch`: Function to manually refetch ideas

**Auto-refresh Example:**
```typescript
import { useIdeas } from '@/hooks/useIdeas';
import { useEffect } from 'react';

function LiveIdeas() {
  const { ideas, loading, refetch } = useIdeas(10);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refetch, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  return <div>{/* render ideas */}</div>;
}
```

### `useStats` Hook

**Location:** `src/hooks/useStats.ts`

React hook for fetching and managing platform statistics.

**Usage:**
```typescript
import { useStats } from '@/hooks/useStats';

function HeroStats() {
  const { stats, loading, error, refetch } = useStats();

  if (loading) return <div>Loading stats...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return null;

  return (
    <div>
      <div>
        <span>{stats.total_ideas}+</span>
        <p>Ideas Analyzed</p>
      </div>
      <div>
        <span>{stats.data_sources}+</span>
        <p>Data Sources</p>
      </div>
      <button onClick={refetch}>Refresh Stats</button>
    </div>
  );
}
```

**Returns:**
- `stats`: `Stats` object or null
- `loading`: Boolean loading state
- `error`: Error message string or null
- `refetch`: Function to manually refetch stats

---

## Integration Examples

### Sample Ideas Component

Update `src/components/SampleIdeas.tsx` to use real data:

```typescript
import { motion } from 'framer-motion';
import { useIdeas } from '@/hooks/useIdeas';

export default function SampleIdeas() {
  const { ideas, loading, error } = useIdeas(6);

  if (loading) {
    return (
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Sample Ideas</h2>
            <p className="text-xl text-gray-400">
              Loading trending opportunities...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-dark-700 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-dark-600 rounded mb-4"></div>
                <div className="h-20 bg-dark-600 rounded mb-4"></div>
                <div className="h-4 bg-dark-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Sample Ideas</h2>
          <p className="text-xl text-red-400">
            Unable to load ideas. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-dark-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Trending Opportunities
          </h2>
          <p className="text-xl text-gray-400">
            Live ideas discovered by ShapeX AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-700 rounded-lg p-6 border border-gray-800 hover:border-razer-green transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-razer-green/10 text-razer-green text-sm rounded-full">
                  {idea.category}
                </span>
                <span className="text-2xl font-bold text-razer-green">
                  {idea.overall_score.toFixed(1)}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">{idea.title}</h3>
              <p className="text-gray-400 mb-4 line-clamp-3">
                {idea.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Source: {idea.source}</span>
                <span>Market: {idea.market_score.toFixed(1)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Hero Stats Section

Update `src/components/Hero.tsx` to use real stats:

```typescript
import { motion } from 'framer-motion';
import { useStats } from '@/hooks/useStats';

export default function Hero() {
  const { stats, loading } = useStats();

  // ... other code ...

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* ... background and content ... */}

      <motion.div
        variants={itemVariants}
        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
      >
        {loading ? (
          // Show loading state
          [1, 2, 3, 4].map(i => (
            <div key={i} className="text-center animate-pulse">
              <div className="h-10 bg-dark-700 rounded mb-2"></div>
              <div className="h-4 bg-dark-700 rounded"></div>
            </div>
          ))
        ) : stats ? (
          // Show real stats
          [
            { number: `${(stats.total_ideas / 1000).toFixed(1)}K+`, label: 'Ideas Analyzed' },
            { number: `${stats.data_sources}+`, label: 'Data Sources' },
            { number: `${(stats.avg_score * 10).toFixed(0)}%`, label: 'Accuracy Rate' },
            { number: '24/7', label: 'Real-time Scanning' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-razer-green mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))
        ) : (
          // Fallback to static stats
          [
            { number: '10K+', label: 'Ideas Analyzed' },
            { number: '50+', label: 'Data Sources' },
            { number: '98%', label: 'Accuracy Rate' },
            { number: '24/7', label: 'Real-time Scanning' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-razer-green mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))
        )}
      </motion.div>
    </section>
  );
}
```

### Pricing Component with Stripe Checkout

Update `src/components/Pricing.tsx` to handle Stripe checkout:

```typescript
import { useState } from 'react';
import { motion } from 'framer-motion';
import { createCheckoutSession } from '@/utils/api';

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleCheckout = async (tier: string) => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    try {
      setLoading(tier);
      const session = await createCheckoutSession({
        email,
        tier,
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/pricing`,
      });

      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for exploring',
      features: ['10 API requests', 'Basic ideas', 'Email support'],
      cta: 'Get Started',
      tier: 'free',
    },
    {
      name: 'Indie',
      price: '$49',
      description: 'For solo founders',
      features: ['100 requests/month', 'All features', 'Priority support'],
      cta: 'Start Free Trial',
      tier: 'indie',
      popular: true,
    },
    // ... more tiers ...
  ];

  return (
    <section className="py-24 bg-dark-900">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">
          Choose Your Plan
        </h2>

        <div className="max-w-md mx-auto mb-12">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-lg focus:border-razer-green outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              className={`bg-dark-800 rounded-lg p-8 ${
                tier.popular ? 'border-2 border-razer-green' : 'border border-gray-800'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="text-4xl font-bold text-razer-green mb-4">
                {tier.price}
                <span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mb-6">{tier.description}</p>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-razer-green mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(tier.tier)}
                disabled={loading === tier.tier}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  tier.popular
                    ? 'bg-razer-green text-black hover:bg-razer-green/90'
                    : 'bg-dark-700 text-white hover:bg-dark-600'
                } ${loading === tier.tier ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === tier.tier ? 'Loading...' : tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Environment Variables

### Development (`.env`)
```env
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Production (`.env.production`)
```env
VITE_API_URL=https://api.shapex.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Important:** Never commit `.env` files to Git!

---

## Error Handling

### Global Error Boundary

Create `src/components/ErrorBoundary.tsx`:

```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-8">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-razer-green text-black font-bold rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Use in `src/main.tsx`:
```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
```

---

## Testing

### Manual Testing Checklist

- [ ] Ideas load on Sample Ideas section
- [ ] Stats display correctly in Hero section
- [ ] Loading states show properly
- [ ] Error states display when API is down
- [ ] Email validation works in pricing
- [ ] Stripe checkout redirects correctly
- [ ] Success page displays after checkout
- [ ] API errors show user-friendly messages

### Test API Connectivity

```bash
# Test backend health
curl http://localhost:8000/health

# Test ideas endpoint
curl http://localhost:8000/api/ideas?limit=5

# Test stats endpoint
curl http://localhost:8000/api/stats
```

---

## Troubleshooting

### CORS Issues

If you see CORS errors in browser console:

1. Ensure backend CORS is configured:
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "https://shapex.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. Check API_BASE URL in `api.ts`
3. Verify backend is running on correct port

### API Not Loading

1. Check backend is running: `curl http://localhost:8000/health`
2. Check environment variable: `console.log(import.meta.env.VITE_API_URL)`
3. Check browser console for errors
4. Verify network tab in DevTools

### Stripe Checkout Not Working

1. Verify Stripe API keys are correct
2. Check backend billing routes are working
3. Test with Stripe test cards: `4242 4242 4242 4242`
4. Check webhook endpoint is registered

---

## Next Steps

1. **Test Integration**: Run backend and frontend, verify all API calls work
2. **Update Components**: Replace placeholder data with real API data
3. **Add Loading States**: Implement skeleton loaders for better UX
4. **Error Handling**: Add retry logic and user-friendly error messages
5. **Performance**: Implement caching and request debouncing
6. **Monitoring**: Add analytics to track API performance
7. **Deploy**: Follow DEPLOYMENT.md to launch to production

---

## Support

For API-specific issues:
- Backend docs: `C:\Users\kacnf\shapex\backend\README.md`
- Stripe integration: `C:\Users\kacnf\shapex\STRIPE_SETUP.md`
- Deployment: `C:\Users\kacnf\shapex\landing\DEPLOYMENT.md`
