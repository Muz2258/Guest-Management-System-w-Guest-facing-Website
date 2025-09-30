# Wedding Guest Management System
This is a mono-repo comprising of an Admin app project and a guest-facing webstie project.

## Project Structure

```
Code/
├── Admin-app/     # Vue.js admin interface with Element Plus
├── Guest-Website/ # Vue.js public website with Tailwind CSS
└── package.json   # Root workspace configuration
```

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Tech Stack

- Backend:
  - Supabase (Database, Authentication, and APIs)

- Admin Interface:
  - Vue.js 3
  - TypeScript
  - Element Plus
  
- Guest Website:
  - Vue.js 3
  - TypeScript
  - Tailwind CSS
  - Pinia (State Management)
  - Vue Router
  - Vite (Build Tool)

## Features

- Guest management and organization
- RSVP tracking and management
- User authentication and authorization
- Real-time data updates
- Responsive design for desktop and tablet
- Guest RSVP management with plus-one options
- Event details and schedule display
- Interactive gallery with infinite scroll
- Gift registry with contribution options
- Goodwill message system
- Mobile-first responsive design
- Cookie banner and privacy compliance

## Development

For detailed development instructions, see:
- [Admin App README](./Admin-app/README.md)
- [Guest Website README](./Guest-Website/README.md)

## License

This project is private and confidential.
