# ShapeX Frontend v2 - Modern React Application

## Overview
Modern React 19 frontend for ShapeX with advanced animations, interactive visualizations, and real-time updates.

## Tech Stack
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui + Aceternity UI
- **Animations**: Motion (Framer Motion) + GSAP
- **Visualizations**: Recharts + D3.js
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Real-Time**: Socket.IO

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend running on port 8000

### Installation
```bash
cd frontend-v2
npm install
```

### Development
```bash
npm run dev
```
Open http://localhost:5173

### Build for Production
```bash
npm run build
npm run preview  # Preview production build
```

## Project Structure
```
src/
├── pages/           # Page components (Dashboard, Ideas, Trends, Scans)
├── components/      # Reusable components
│   ├── ui/          # Shadcn/ui components
│   ├── aceternity/  # Aceternity UI components
│   ├── layout/      # Layout components (Header, PageContainer)
│   ├── dashboard/   # Dashboard-specific components
│   ├── ideas/       # Ideas page components
│   └── trends/      # Trends page components
├── lib/             # Utilities (API client, helpers)
├── types/           # TypeScript type definitions
├── hooks/           # Custom React hooks
├── store/           # Zustand stores
└── styles/          # Global styles (Tailwind + custom CSS)
```

## Configuration

### API Proxy
The Vite dev server proxies `/api/*` requests to `http://localhost:8000` (FastAPI backend).

### Environment Variables
Create `.env` file if needed:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Roadmap

### Week 1: Foundation + Dashboard ✅
- [x] Project setup with Vite + React + TypeScript
- [x] Tailwind CSS v4 configuration
- [x] React Router and React Query setup
- [ ] Hero section with animated background
- [ ] Stats grid with 3D flip cards
- [ ] Opportunities carousel
- [ ] Trends preview section

### Week 2: Ideas Pages + Visualizations
- [ ] Ideas list with filters and search
- [ ] Idea detail page
- [ ] Score radar charts
- [ ] D3.js network graph for trends

### Week 3: Polish + Real-Time
- [ ] Micro-interactions and animations
- [ ] WebSocket integration
- [ ] Scans page with live progress
- [ ] Mobile responsive design
- [ ] Accessibility improvements

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Keep components small and focused

### Component Guidelines
- One component per file
- Export component as default
- Use descriptive prop types
- Add JSDoc comments for complex components

### Animation Guidelines
- Use Motion for micro-interactions
- Use GSAP for complex animations
- Target 60fps for all animations
- Respect `prefers-reduced-motion`

## Performance Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Performance: >85
- Lighthouse Accessibility: >95

## Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## License
MIT
