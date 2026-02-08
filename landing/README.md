# ShapeX Landing Page

Modern, production-ready landing page for ShapeX Market Intelligence platform. Built with React 18, TypeScript, Vite, Tailwind CSS v4, and Framer Motion.

## Features

- **Apple-inspired Design**: Clean, minimal, professional aesthetic
- **Dark Theme**: Razer green accents (#00FF00) on dark background
- **Fully Responsive**: Mobile-first design, optimized for all devices
- **Smooth Animations**: Framer Motion for fluid transitions and interactions
- **Performance Optimized**: Lighthouse score >90
- **SEO Ready**: Proper meta tags, semantic HTML, structured data
- **API Integration**: Live data from ShapeX backend
- **Type-Safe**: Full TypeScript coverage

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling framework
- **Framer Motion** - Animation library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The landing page will be available at http://localhost:3001

### Environment Variables

Create a `.env` file:

```bash
VITE_API_URL=http://localhost:8000/api
```

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Components

- **Navigation** - Sticky header with mobile menu
- **Hero** - Full-screen intro with animations
- **Features** - 5 feature cards with hover effects
- **Pricing** - 4 pricing tiers with comparison table
- **Sample Ideas** - Live data from ShapeX API
- **FAQ** - Accordion-style questions
- **Footer** - Links, social media, newsletter

## API Integration

```typescript
import { fetchIdeas, registerUser } from './utils/api';

// Fetch ideas
const ideas = await fetchIdeas(5);

// Register user
await registerUser('user@example.com', 'pro');
```

## Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## License

MIT License - see LICENSE file for details

---

Built with ❤️ for builders by the ShapeX team.
