# Code PvP — Development Roadmap

A step-by-step guide to get the project running locally and understand the development workflow.

---

## Prerequisites

| Tool       | Version | Purpose                          |
| ---------- | ------- | -------------------------------- |
| Node.js    | ≥ 18    | Runtime for both client & server |
| PostgreSQL | ≥ 15    | Primary database                 |
| Redis      | ≥ 7     | Matchmaking queue & pub/sub      |
| Docker     | Latest  | Optional — run everything in containers |

---

## Phase 1 — Environment Setup

### Option A: Docker (recommended)

```bash
# From the project root
cp server/.env.example server/.env
# Set your JUDGE0_API_KEY in the .env file

docker compose up -d
```

This starts PostgreSQL, Redis, the backend server (port 4000), and the Next.js client (port 3000).

### Option B: Local

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your database URL, Redis URL, and Judge0 API key

# 3. Setup database
cd server
npx prisma migrate dev --name init
npx prisma db seed

# 4. Start backend
npm run dev          # Runs on http://localhost:4000

# 5. Start frontend (new terminal)
cd client
npm run dev          # Runs on http://localhost:3000
```

---

## Phase 2 — Core Feature Verification

| #  | Feature              | How to verify                                             |
| -- | -------------------- | --------------------------------------------------------- |
| 1  | Auth (signup/login)  | Create an account, log in, check JWT token in localStorage |
| 2  | Dashboard            | After login you should see stats and rating               |
| 3  | Matchmaking queue    | Open two browsers, log in as different users, click "Find Match" |
| 4  | Coding duel          | Both players land on `/duel/:matchId`, see problem + editor |
| 5  | Code execution       | Click "Run" — sample test results appear in the Results tab |
| 6  | Submission           | Click "Submit" — all test cases run, verdict shown         |
| 7  | ELO update           | After match ends, check both users' ratings changed        |
| 8  | Leaderboard          | Visit `/leaderboard` — users sorted by rating             |
| 9  | Match history        | Visit `/history` — past matches with result & delta        |
| 10 | Spectate             | Visit `/spectate` during a live match, click "Watch"       |

---

## Phase 3 — Architecture Highlights

### Backend (`/server`)

```
src/
├── config/          # Environment, database, redis, constants
├── middleware/       # Auth (JWT), error handler, validation (Zod)
├── routes/          # REST API endpoints
├── services/        # Business logic
│   ├── auth.service.ts
│   ├── elo.service.ts
│   ├── judge0.service.ts
│   ├── matchmaking.service.ts
│   └── match-room.service.ts
├── socket/          # Socket.IO event handlers
└── index.ts         # Express + Socket.IO entry point
```

### Frontend (`/client`)

```
src/
├── app/
│   ├── page.tsx                       # Landing page
│   ├── login/ & signup/               # Auth pages
│   └── (authenticated)/               # Route group with sidebar
│       ├── dashboard/
│       ├── lobby/
│       ├── duel/[matchId]/
│       ├── leaderboard/
│       ├── history/
│       └── spectate/
├── components/
│   ├── ui/                            # Shadcn primitives
│   ├── layout/                        # Sidebar, dashboard layout
│   └── *.tsx                          # Custom components
├── hooks/                             # useSocket, useMatchmaking, useMatchRoom
└── lib/                               # API client, socket client, auth context
```

---

## Phase 4 — Extending the Platform

### Adding a new problem

1. Add entries to the `Problem` and `TestCase` tables (see `prisma/seed.ts` for format)
2. Provide `starterCode` as a JSON map: `{ javascript: "...", python: "...", cpp: "...", java: "..." }`
3. Mark test cases as `isHidden: true` for submission-only tests

### Adding a new language

1. Add the language ID mapping in `server/src/config/constants.ts` (`JUDGE0_LANGUAGE_MAP`)
2. Add the option in the frontend `LANGUAGES` array in the Duel page
3. Provide starter code for existing problems

### Scaling matchmaking

- The matchmaking service uses a Redis sorted set ordered by rating
- The `processQueue()` interval can be tuned (currently 2s)
- Rating range expands over time — see `MATCHMAKING_CONSTANTS` in `constants.ts`

---

## Phase 5 — Production Checklist

- [ ] Set strong `JWT_SECRET` and `DATABASE_URL` values
- [ ] Enable HTTPS for both client and server
- [ ] Configure `CORS_ORIGIN` to your production domain
- [ ] Set up a Judge0 self-hosted instance or use RapidAPI with a paid plan
- [ ] Add rate limiting to auth routes
- [ ] Enable Prisma connection pooling (PgBouncer)
- [ ] Set up logging (e.g., Pino, Winston)
- [ ] Configure health check endpoints
- [ ] Add CI/CD pipeline (GitHub Actions)
- [ ] Set `output: "standalone"` in `next.config.js` for Docker production builds

---

## Tech Stack Summary

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| Frontend      | Next.js 14, Tailwind CSS, Shadcn UI |
| Code Editor   | Monaco Editor (@monaco-editor/react) |
| Backend       | Express, Socket.IO                  |
| Database      | PostgreSQL + Prisma ORM             |
| Cache/Queue   | Redis (ioredis)                     |
| Auth          | JWT (jsonwebtoken + bcryptjs)       |
| Validation    | Zod                                 |
| Code Judge    | Judge0 CE API                       |
| Containerization | Docker + Docker Compose          |
