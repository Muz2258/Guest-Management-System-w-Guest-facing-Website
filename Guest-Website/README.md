# Wedding Guest Website

Public website for wedding guests built with Vue.js and Tailwind CSS.

## Tech Stack

- Vue.js 3
- TypeScript
- Tailwind CSS
- Pinia for state management
- Vue Router
- Vite build tool

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/  # Reusable Vue components
├── views/       # Page components
├── stores/      # Pinia state stores
├── router/      # Vue Router configuration
├── types/       # TypeScript interfaces
├── utils/       # Helper functions
└── composables/ # Vue composable functions
```

## Features

- Guest authentication
- RSVP submission
- Plus-one management
- Event details
- Gift registry
- Photo gallery

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run analyze` - Analyze bundle size

## Environment Variables

Required environment variables:

- `APP_DATABASE_URL` - Supabase project URL
- `APP_DATABASE_ANON_KEY` - Supabase anonymous key

## Performance Optimization

- Lazy loading of routes
- Image optimization
- Tree-shaking enabled
- Bundle analyzer available
