# Big Feelings Toolkit App

## Overview

Big Feelings Toolkit App is a teacher-led web/mobile web system that digitizes a paper-based SEL framework for 5th-6th grade emotional regulation. This scaffold sets up the production-ready frontend foundation for future authentication, student profiles, check-ins, and reporting workflows.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ESLint
- Prettier (+ Tailwind class sorting plugin)
- Planned hosting: Netlify
- Planned database: Neon Postgres

## Local Development

Prerequisites:

- Node.js 18+ (Node 20+ recommended for newer ecosystem tooling)
- npm

Install dependencies:

```bash
npm install
```

Never commit `.env` files. Keep real secrets in `.env.local` only.

Create your local env file from `.env.example`:

```bash
# macOS/Linux
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

Then fill in real values in `.env.local` (example required runtime keys):

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=replace-with-strong-secret
NEXTAUTH_URL=http://localhost:3000
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Build

Create a production build:

```bash
npm run build
```

## Health Check

Server-side DB connectivity check:

`GET /api/health`

This route executes `select 1 as ok` against Postgres and returns JSON status.

## Authentication

- Auth.js / NextAuth credentials login is enabled for staff users only (students do not log in).
- Sign-in page: `/auth/signin`
- Successful sign-in redirects to: `/dashboard`
- Protected paths: `/dashboard/*` and `/app/*`

## Database Seed (School + Admin User)

The project includes an idempotent seed script at `scripts/seed.ts` that:

1. Creates/reuses a school by name in `schools`
2. Creates/reuses an admin staff user in `users` linked to that school
3. Uses bcrypt hashing for the admin password (plaintext is never stored)

Required seed environment variables:

```bash
SEED_ADMIN_EMAIL=admin@gpsbulldogs.org
SEED_ADMIN_NAME=Oakestown Admin
SEED_ADMIN_PASSWORD=ChangeThisToAStrongPassword123!
```

Optional (defaults shown):

```bash
SEED_SCHOOL_NAME="Oakestown Intermediate School"
SEED_DISTRICT_NAME="Grandville Public Schools"
```

Step-by-step:

1. Add the required seed values to `.env.local`.
2. Run (uses `tsx` for Windows-friendly TypeScript execution):

```bash
npm run db:seed
```

3. Sign in at `/auth/signin` with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

## Secret Safety

- `.env` and `.env.*` are gitignored.
- `.env.example` is allowed and should contain keys only (no real secrets).
- A Husky pre-commit hook blocks commits that include `.env` files.

Run the optional secrets scan:

```bash
npm run secrets:scan
```

## Deployment Note

Netlify supports Next.js App Router projects and can deploy this app directly from the repository.
