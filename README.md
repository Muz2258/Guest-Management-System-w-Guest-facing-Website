# Wedding Guest Management System

This is a complete wedding guest management system built with TypeScript, using Supabase as the backend and two Vue.js frontend applications.

## Project Structure

```
Code/
├── Admin-app/     # Vue.js admin interface with Element Plus
└── Guest-Website/ # Vue.js public website with Tailwind CSS
```

## Getting Started

1. Clone the repository
2. Install dependencies for all projects:
```bash
npm install
```

3. Copy the `.env.example` files in each project directory to `.env` and fill in your environment variables

4. Start the development servers:

```bash
# Start backend server
npm run dev:backend

# Start admin interface
npm run dev:admin

# Start guest website
npm run dev:guest
```

## Tech Stack

- Backend:
  - Supabase (Database, Authentication, and APIs)

- Admin Interface:
  - Vue.js 3
  - TypeScript
  - Element Plus
  - Pinia
  - Vue Router

- Guest Website:
  - Vue.js 3
  - TypeScript
  - Tailwind CSS
  - Pinia
  - Vue Router

## Development

Each project has its own README with specific instructions:

- [Backend README](./Backend/README.md)
- [Admin App README](./Admin-app/README.md)
- [Guest Website README](./Guest-Website/README.md)

## License

This project is private and confidential.
