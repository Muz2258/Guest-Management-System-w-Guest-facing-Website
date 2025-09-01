# Wedding Management Admin Interface

Admin interface for the wedding guest management system built with Vue.js and Element Plus.

## Tech Stack

- Vue.js 3
- TypeScript
- Element Plus UI framework
- Pinia for state management
- Vue Router
- Vite build tool

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

3. Start development server:
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

- Guest list management
- RSVP tracking
- Table assignments
- Payment tracking
- Guest communications

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run analyze` - Analyze bundle size

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
