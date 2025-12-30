<p align="center">
  <img src="public/icon.svg" alt="Meet Logo" width="72"/>
</p>

# Meet

Real-time video meetings for teams and communities, fast, reliable, and easy to host yourself.

## What is Meet?

Meet is an open-source video meeting application built on Next.js and LiveKit. It provides low-latency audio/video, a clean UI, and simple authentication so you can spin up secure meetings in minutes.

## Why Meet?

- ✅ **Open-Source** – Transparent, forkable, and extensible.
- 🦾 **LiveKit‑Powered** – Adaptive streaming with a modern SFU.
- 🔒 **Privacy‑First** – You control your infrastructure and data.
- ⚙️ **Self-Hosting Freedom** – Run locally or deploy anywhere.
- 🚀 **Developer‑Friendly** – TypeScript, Prisma, and a modular UI.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Radix UI
- **Realtime**: LiveKit (client SDK + server token issuance)
- **Backend**: Next.js API routes (Node.js)
- **Database/ORM**: PostgreSQL + Prisma
- **Authentication**: Better Auth (Email/Password)
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js v18+ and pnpm v10+
- Docker (optional, for running PostgreSQL locally)

Before running the app, configure environment variables. See Environment Variables below.

### Setup Options

1. Clone and Install

```bash
git clone https://github.com/akashwarrior/meet.git
cd meet
pnpm install
```

2. Start PostgreSQL (Local, via Docker)

```bash
docker run -d \
  --name meet-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=meet \
  -p 5432:5432 postgres
```

3. Configure Environment

Copy the existing `.env.example` to `.env` and update the values as needed:

```bash
# macOS/Linux
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env
```

Example values:

```env
NODE_ENV='development'

# Better Auth
BETTER_AUTH_URL='http://localhost:3000'
BETTER_AUTH_SECRET='your_long_random_string'

# Database URL
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/meet"

# LiveKit WebSocket URL (Cloud or self-hosted)
NEXT_PUBLIC_LIVEKIT_URL=ws://127.0.0.1:7880

# API credentials used server-side to mint room tokens
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

4. Initialize the Database

```bash
pnpm run db:generate
pnpm run db:migrate
```

5. Start the App

```bash
pnpm run dev
```

Open http://localhost:3000

## Environment Variables

Required for a typical local setup:

- **NODE_ENV**: Application environment (`development` or `production`)
- **DATABASE_URL**: PostgreSQL connection string
- **BETTER_AUTH_URL**: Public application URL (http://localhost:3000 in dev)
- **BETTER_AUTH_SECRET**: Secret used to sign Better Auth tokens
- **LIVEKIT_API_KEY** and **LIVEKIT_API_SECRET**: Credentials to mint LiveKit access tokens
- **NEXT_PUBLIC_LIVEKIT_URL**: LiveKit WebSocket URL (e.g., `ws://127.0.0.1:7880` for local or `wss://your-livekit-host` for cloud)

Use `.env.example` as your starting point. Copy it to `.env` and then edit values to match your local/production environment.

## LiveKit Setup

You can use LiveKit Cloud or a self‑hosted LiveKit server.

1. Create API credentials and obtain your WS URL.
2. Set `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, and `NEXT_PUBLIC_LIVEKIT_URL` in `.env`.
3. The app will mint per‑user room tokens via `GET /api/token?meetingId=...&username=...`.

## Database

The project uses Prisma with PostgreSQL.

- Generate client: `pnpm run db:generate`
- Apply migrations: `pnpm run db:migrate`
- Inspect data (optional): `pnpm run db:studio`

## Authentication

Meet uses Better Auth with email/password authentication. Authentication routes:

- Sign in/Sign up: `/auth`

Set `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in `.env`. Better Auth provides a more modern, type-safe authentication solution with built-in session management and security features.

## API Overview

- `POST /api/meetings` – Create a meeting (requires authenticated session)
- `GET /api/meetings/[id]` – Validate and join an existing meeting
- `GET /api/token` – Issue a LiveKit token for a user and room

## Scripts

- `pnpm run dev` – Start the development server
- `pnpm run build` – Build for production
- `pnpm run start` – Start the production server
- `pnpm run db:generate` – Generate the Prisma client
- `pnpm run db:migrate` – Run Prisma migrations in dev
- `pnpm run db:studio` – Open Prisma Studio
- `pnpm run lint` – Run ESLint
- `pnpm run typecheck` – Run TypeScript in no-emit mode
- `pnpm run check` – Run lint, typecheck, and production build

---

If you run into setup issues, double‑check your `.env` and ensure PostgreSQL and LiveKit credentials are correct.
