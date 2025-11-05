# AIRE PWA - Daily AIRE (MVP)

A Progressive Web App for the Daily AIRE (Ascending Infinite Recursion Engine) - the cornerstone of the STRIVE OS ecosystem.

## Overview

Daily AIRE is a lightweight PWA that helps participants build clarity, momentum, and agency through a daily PICV (Prime > Improve > Commit > Visualize) cycle.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Library:** shadcn/ui with Tailwind CSS
- **State Management:** Zustand
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with JWT
- **Email:** Resend
- **Charts:** Recharts

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Environment Variables

### Local Development (.env.local)

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vercel Deployment

**Frontend:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Backend:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`
- `RESEND_API_KEY`
- `CRON_SECRET`
- `PWA_URL` (optional, defaults to https://striveos.io/#/)

## Database Setup

Run the SQL scripts in the `sql/` directory:

1. `CREATE_CYCLES_TABLE.sql` - Creates the cycles table
2. `CREATE_USER_PREFERENCES_TABLE.sql` - Creates the user_preferences table

## Project Structure

```
├── api/              # Vercel serverless functions
├── src/
│   ├── components/   # React components
│   ├── lib/          # Utilities and helpers
│   ├── pages/        # Page components
│   ├── store/        # Zustand state management
│   └── hooks/        # Custom React hooks
├── sql/              # Database schema scripts
└── docs/             # Project documentation
```

## Documentation

- `docs/PROJECT_AIRE.md` - Master project plan
- `docs/SPRINT_LOG.md` - Mission completion tracking
- `docs/BREACH_NET.md` - Problems and solutions log
- `docs/CONTEXT_MANAGEMENT.md` - Context window management strategy

## License

MIT
