<p align="center">
  <img src="public/icon.svg" alt="Meet Logo" width="72"/>
</p>

# Meet

Real‑time video meetings for teams and communities fast, reliable, and easy to host yourself.

## What is Meet?

Meet is an open‑source video meeting application built on Next.js and LiveKit. It provides low‑latency audio/video, a clean UI, and simple authentication so you can spin up secure meetings in minutes.

## Why Meet?

- ✅ **Open‑Source** – Transparent, forkable, and extensible.
- 🦾 **LiveKit‑Powered** – Adaptive streaming with a modern SFU.
- 🔒 **Privacy‑First** – You control your infrastructure and data.
- ⚙️ **Self‑Hosting Freedom** – Run locally or deploy anywhere.
- 🚀 **Developer‑Friendly** – TypeScript, Prisma, and a modular UI.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Radix UI
- **Realtime**: LiveKit (client SDK + server token issuance)
- **Backend**: Next.js API routes (Node.js)
- **Database/ORM**: PostgreSQL + Prisma
- **Authentication**: NextAuth (Credentials)
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js v18+ and npm v10+
- Docker (optional, for running PostgreSQL locally)

Before running the app, configure environment variables. See Environment Variables below.

### Setup Options

1) Clone and Install

```bash
git clone https://github.com/akashwarrior/meet.git
cd meet
npm install
```

2) Start PostgreSQL (Local, via Docker)

```bash
docker run -d \
  --name meet-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=meet \
  -p 5432:5432 postgres
```

3) Configure Environment

Copy the existing `.env.example` to `.env` and update the values as needed:

```bash
# macOS/Linux
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env
```

Example values:

```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/meet"

# NextAuth
NEXTAUTH_SECRET=your_long_random_string
# Recommended for NextAuth callbacks and URLs in development
NEXTAUTH_URL=http://localhost:3000

# Optional cookie domain for auth (omit in local dev)
# BASE_URL=your-domain.com

# LiveKit
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-host
```

4) Initialize the Database

```bash
npm run generate
npm run db:migrate
```

5) Start the App

```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

Required for a typical local setup:

- **DATABASE_URL**: PostgreSQL connection string
- **NEXTAUTH_SECRET**: Secret used to sign NextAuth tokens
- **NEXTAUTH_URL**: Public application URL (http in dev)
- **LIVEKIT_API_KEY** and **LIVEKIT_API_SECRET**: Credentials to mint LiveKit access tokens
- **NEXT_PUBLIC_LIVEKIT_URL**: LiveKit WebSocket URL (e.g., `wss://your-livekit-host`)
- **BASE_URL** (optional): Cookie domain for auth; leave unset in development

Use `.env.example` as your starting point. Copy it to `.env` and then edit values to match your local/production environment.

## LiveKit Setup

You can use LiveKit Cloud or a self‑hosted LiveKit server.

1) Create API credentials and obtain your WS URL.
2) Set `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, and `NEXT_PUBLIC_LIVEKIT_URL` in `.env`.
3) The app will mint per‑user room tokens via `GET /api/token?meetingId=...&username=...`.

## Database

The project uses Prisma with PostgreSQL.

- Generate client: `npm run generate`
- Apply migrations: `npm run db:migrate`
- Inspect data (optional): `npx prisma studio`

## Authentication

Meet uses NextAuth with the Credentials provider. Default routes:

- Sign in: `/auth/login`
- Sign up: `/auth/signup`

Set `NEXTAUTH_SECRET` (and `NEXTAUTH_URL` in development) in `.env`. For custom domains, set `BASE_URL` to your cookie domain if needed.

## API Overview

- `POST /api/meetings` – Create a meeting (requires authenticated session)
- `GET /api/meetings/[id]` – Validate and join an existing meeting
- `GET /api/token` – Issue a LiveKit token for a user and room

## Scripts

- `npm run dev` – Start the development server
- `npm run build` – Build for production
- `npm run start` – Start the production server
- `npm run generate` – Generate Prisma client
- `npm run db:migrate` – Run Prisma migrations in dev
- `npm run lint` – Lint project

---

If you run into setup issues, double‑check your `.env` and ensure PostgreSQL and LiveKit credentials are correct.
