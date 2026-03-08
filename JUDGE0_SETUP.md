# Running Judge0 Locally with Docker

Judge0 CE is the code-execution engine used by this project. This guide explains how to run it locally.

---

## Prerequisites

- **Docker Desktop** (macOS/Windows) or Docker Engine (Linux)
- **cgroup v1** enabled — required by Judge0's `isolate` sandbox (**macOS only, see below**)

---

## Step 1 — Enable cgroup v1 on macOS (one-time)

Judge0 uses Linux kernel cgroups v1 to isolate submissions. Docker Desktop on modern macOS defaults to cgroup v2, which breaks Judge0.

1. Quit Docker Desktop completely.

2. Open the Docker Desktop settings file:

   ```
   ~/Library/Group Containers/group.com.docker/settings-store.json
   ```

3. Add the following key (keep all existing keys):

   ```json
   "deprecatedCgroupv1": true
   ```

4. Save the file and **restart Docker Desktop**.

5. Verify it worked:

   ```bash
   docker info | grep "Cgroup Version"
   # Expected output:
   #  Cgroup Version: 1
   ```

> **Linux users**: cgroup v1 is the default on most distros — no action needed.  
> **Windows (WSL2) users**: Add `"deprecatedCgroupv1": true` to the same settings file at `%APPDATA%\Docker\settings-store.json`.

---

## Step 2 — Start the Judge0 services

The `docker-compose.yml` in this repo includes four Judge0 services:

| Service          | Role                                      |
|------------------|-------------------------------------------|
| `judge0-db`      | PostgreSQL database for Judge0            |
| `judge0-redis`   | Redis queue for job scheduling            |
| `judge0-server`  | Judge0 Rails API (port **2358**)          |
| `judge0-workers` | Background workers that run submissions   |

Start them in order (database and redis must be ready first):

```bash
# Start dependency services first
docker compose up -d judge0-db judge0-redis

# Wait ~5 seconds, then start the server and workers
docker compose up -d judge0-server judge0-workers
```

Or start everything at once (Docker Compose handles dependency order):

```bash
docker compose up -d
```

---

## Step 3 — Verify Judge0 is running

```bash
curl http://localhost:2358/about
```

Expected response (JSON with version info):

```json
{"version":"1.13.1", ...}
```

If you get `Connection refused`, wait 10–15 seconds for the server to finish initialising and try again.

---

## Step 4 — Configure the server

Your `server/.env` should have:

```env
JUDGE0_API_URL="http://localhost:2358"
JUDGE0_API_KEY=""
```

`JUDGE0_API_KEY` is only needed for the RapidAPI hosted version — leave it empty for local usage.

---

## Quick smoke test

```bash
# Submit a JavaScript "Hello World" and wait for result
curl -s -X POST http://localhost:2358/submissions?wait=true \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "console.log(\"Hello from Judge0!\")",
    "language_id": 63
  }' | python3 -m json.tool
```

`status.description` should be `"Accepted"` and `stdout` should be `"Hello from Judge0!\n"`.

---

## Stopping Judge0

```bash
docker compose stop judge0-server judge0-workers judge0-db judge0-redis
```

Or stop and remove all containers:

```bash
docker compose down
```

To also delete Judge0's database volume (resets all data):

```bash
docker compose down -v
```

---

## Supported languages (common)

| Language    | `language_id` |
|-------------|--------------|
| C           | 50           |
| C++         | 54           |
| Java        | 62           |
| JavaScript  | 63           |
| Python 3    | 71           |
| TypeScript  | 74           |
| Go          | 60           |
| Rust        | 73           |

Full list: `GET http://localhost:2358/languages`

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `isolate: cgroup not found` in workers log | cgroup v2 is active | Complete Step 1 |
| `Connection refused` on port 2358 | Server still starting | Wait 10–15 s |
| Submissions always time out | Workers not running | `docker compose up -d judge0-workers` |
| `403 Forbidden` from server code | Stale `JUDGE0_API_KEY` pointing to RapidAPI | Set `JUDGE0_API_KEY=""` and restart server |
