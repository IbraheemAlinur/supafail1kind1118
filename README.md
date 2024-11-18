# 1Kind AI Platform

A community-driven platform connecting leaders, entrepreneurs, and innovators through meaningful collaboration and resource sharing.

## Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/1kind-ai.git
cd 1kind-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your Supabase configuration.

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run clean` - Clean build artifacts and dependencies
- `npm run reinstall` - Clean and reinstall dependencies

## Deployment

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Deploy to Netlify:
- Connect your GitHub repository
- Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`
- Add environment variables in Netlify dashboard

## Database Schema

The database schema is managed through Supabase migrations. The initial schema can be found in `supabase/migrations/20240315000000_initial_schema.sql`.

### Key Tables:

- `users` - User profiles and authentication
- `communities` - Community information and settings
- `posts` - User posts (asks/offers)
- `events` - Community events
- `messages` - User-to-user messages
- `transactions` - Ki points transactions

### Row Level Security:

The schema includes Row Level Security (RLS) policies to ensure data access control:

- Users can only modify their own data
- Public content is readable by all authenticated users
- Community content is restricted based on membership
- Messages are only accessible to participants

## License

MIT License - see LICENSE file for details