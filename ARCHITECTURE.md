# LeetCode Battleground — System Architecture

## High-Level Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │  Auth UI  │ │  Lobby   │ │  Editor  │ │  Leaderboard/Hist  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬───────────┘  │
│       │             │            │                 │              │
│  ┌────▼─────────────▼────────────▼─────────────────▼───────────┐ │
│  │              API Client + Socket.IO Client                  │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │ REST API     │  WebSocket   │
              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (Express + Socket.IO)                │
│                                                                  │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────────────────┐  │
│  │  Auth      │ │  Matchmaking │ │  Match Room Manager       │  │
│  │  Service   │ │  Service     │ │  (WebSocket Rooms)        │  │
│  └─────┬──────┘ └──────┬───────┘ └────────────┬──────────────┘  │
│        │               │                      │                  │
│  ┌─────▼──────┐ ┌──────▼───────┐ ┌────────────▼──────────────┐  │
│  │  JWT       │ │  Redis Queue │ │  Judge0 Integration       │  │
│  │  Manager   │ │  (BullMQ)    │ │  Service                  │  │
│  └─────┬──────┘ └──────┬───────┘ └────────────┬──────────────┘  │
│        │               │                      │                  │
│  ┌─────▼───────────────▼──────────────────────▼──────────────┐  │
│  │                    Prisma ORM                              │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
    │  PostgreSQL  │ │    Redis    │ │   Judge0 API │
    │  (Primary)   │ │  (Queue +   │ │  (External)  │
    │              │ │   Cache)    │ │              │
    └──────────────┘ └─────────────┘ └──────────────┘
```

## Data Flow

### 1. Authentication Flow
```
Client → POST /api/auth/signup → Hash password → Store in DB → Return JWT
Client → POST /api/auth/login  → Verify password → Return JWT
Client → All requests include Authorization: Bearer <token>
```

### 2. Matchmaking Flow
```
Client → Socket: "queue:join" → Add to Redis sorted set (by rating)
Redis → Every 2s: scan queue → Find ±100 rating match
Match found → Create Match in DB → Create Socket Room
Socket → Emit "match:found" to both players → Navigate to /duel/:matchId
```

### 3. Code Execution Flow
```
Client → Socket: "code:submit" → Server validates
Server → POST Judge0 /submissions (batch for all test cases)
Server → Poll Judge0 for results (or use callback)
Server → Evaluate: all passed = Accepted, else WA/TLE/RE
Server → Socket: "submission:result" to player
Server → Socket: "opponent:submitted" to opponent
If Accepted → Check if first solver → End match → Update ELO
```

### 4. ELO Rating System
```
K-factor: 32 (default), 16 (rating > 2000)
Expected score: E = 1 / (1 + 10^((Rb - Ra) / 400))
New rating: Ra' = Ra + K * (S - E)
  where S = 1 (win), 0.5 (draw), 0 (loss)
```

### 5. WebSocket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `queue:join` | C→S | `{ userId }` | Join matchmaking queue |
| `queue:leave` | C→S | `{ userId }` | Leave queue |
| `queue:status` | S→C | `{ position, estimated }` | Queue position update |
| `match:found` | S→C | `{ matchId, opponent, problem }` | Match created |
| `match:ready` | C→S | `{ matchId }` | Player ready |
| `match:start` | S→C | `{ matchId, startTime }` | Match begins |
| `code:run` | C→S | `{ matchId, code, language }` | Run code |
| `code:submit` | C→S | `{ matchId, code, language }` | Submit solution |
| `code:result` | S→C | `{ verdict, time, memory }` | Execution result |
| `opponent:status` | S→C | `{ status }` | Opponent activity |
| `match:end` | S→C | `{ winner, ratings }` | Match ended |
| `spectator:join` | C→S | `{ matchId }` | Join as spectator |
| `spectator:update` | S→C | `{ submissions }` | Live updates |

## API Routes

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user

### Users
- `GET /api/users/:id` — User profile
- `GET /api/users/:id/stats` — User statistics

### Problems
- `GET /api/problems` — List problems (paginated, filterable)
- `GET /api/problems/:id` — Problem detail (public test cases only)

### Matches
- `GET /api/matches` — Match history (authenticated user)
- `GET /api/matches/:id` — Match detail
- `GET /api/matches/live` — Ongoing matches (for spectators)

### Leaderboard
- `GET /api/leaderboard` — Global rankings (paginated)

### Submissions
- `GET /api/submissions/:matchId` — Submissions for a match
