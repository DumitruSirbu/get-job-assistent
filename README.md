# get-job-assistent

A personal NestJS backend that automates the full job-search pipeline: scrape LinkedIn job listings via Apify, extract a structured candidate profile from your CV using a local LLM (Ollama), score every scraped job against your profile, and track your applications — all stored in PostgreSQL. Exposes a dashboard API protected by JWT authentication.

---

## How it works

```
LinkedIn (Apify scraper)
        │
        ▼
  job_description table
        │
        ├──────────────────────────────────┐
        │                                  │
        ▼                                  ▼
  CV file (src/cv/)              candidate_profile table
        │                                  │
        └──────────┬───────────────────────┘
                   │
                   ▼
          Ollama (local LLM)
                   │
                   ▼
         job_match_score table
                   │
                   ▼
      candidate_application table
```

1. **Scrape jobs** — call the Apify LinkedIn Jobs Scraper actor, normalize results, and persist them in `job_description`.
2. **Process CV** — send your CV text to a local Ollama model; it returns structured JSON (skills, experience level, location, etc.) which is saved as a `candidate_profile` record.
3. **Score jobs** — for each unscored job, send the job description + candidate profile to the same Ollama model; it returns a 0–100 match score plus a reasoning breakdown saved in `job_match_score`.
4. **Track applications** — mark jobs you have applied to and track their status through the application lifecycle.

---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node 22, TypeScript (ES2023, `nodenext`) |
| Framework | NestJS 11 |
| Database | PostgreSQL 16 via TypeORM (migration-driven, no `synchronize`) |
| Queue | BullMQ + Redis 7 |
| LLM | Ollama (local, model configurable — default `gemma4`) |
| Job scraper | Apify Client — LinkedIn Jobs Scraper actor |
| Auth | JWT (`@nestjs/jwt`, `passport-jwt`); global guard; refresh-token rotation |
| Infra | Docker Compose |

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Node 22 | `node -v` to verify |
| Docker & Docker Compose | For Postgres + Redis |
| [Ollama](https://ollama.com) | Running locally on port 11434 |
| Apify account | Free tier is sufficient; grab your API token from the [Apify console](https://console.apify.com/settings/integrations) |

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd get-job-assistent
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

```env
# Apify — required for job scraping
APIFY_TOKEN=your_apify_token_here

# Postgres — used as-is for local dev
POSTGRES_URL=postgres://app:app@localhost:5432/getjob

# Ollama — defaults work if Ollama is running locally
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma4

# JWT — generate a secure random string for each secret
JWT_SECRET=change_me
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_refresh
JWT_REFRESH_EXPIRES_IN=7d

# CORS — URL of the dashboard frontend (for local dev: http://localhost:5173)
DASHBOARD_URL=http://localhost:5173
```

### 3. Start infrastructure

```bash
docker compose up postgres redis -d
```

This starts Postgres 16 and Redis 7 with persistent volumes.

### 4. Run database migrations

```bash
npm run migration:run
```

This applies all migrations in order across all domain modules (`job`, `candidate`, `job-scoring`).

### 5. Add your CV

Place your CV as a plain-text file at:

```
src/cv/cv-v1.txt
```

The filename convention is `cv-{version}.txt`. The version string is passed as a query parameter when processing.

### 6. Start Ollama and pull the model

```bash
ollama pull gemma4
ollama serve   # if not already running as a background service
```

### 7. Start the app

```bash
# Development (with file watching)
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## API Endpoints

All endpoints except authentication require a valid JWT `Authorization: Bearer <token>` header.

**Full API reference:** See [docs/api.md](./docs/api.md)

**WebSocket events:** See [docs/websocket.md](./docs/websocket.md)

Quick reference:
- Auth: `POST /user/register|login|refresh` (all public)
- Jobs: `GET /job-description`, `POST /job-description/process-new-jobs`
- Candidates: `GET /candidate-profile`, `POST /candidate-profile/process-cv`
- Applications: `GET|POST|PATCH|DELETE /candidate-profile/:candidateProfileId/applications/:applicationId`
- Scoring: `GET /job-scoring/candidate/:candidateId`, `POST /job-scoring/score-newest-jobs/:candidateId`
- Companies: `GET /company`, `PATCH /company/:id/blacklist|unblacklist`
- Lookups: `GET /apply-type`, `GET /contract-type`, etc.

---

## Recommended workflow

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"s3cr3t"}' | jq -r .accessToken)

AUTH="-H \"Authorization: Bearer $TOKEN\""

# 1. Ingest jobs (choose one)
curl -X POST $AUTH http://localhost:3000/job-description/process-new-jobs   # live Apify scrape
curl -X POST $AUTH http://localhost:3000/job-description/process-from-file  # local file

# 2. Build candidate profile from CV
curl -X POST $AUTH http://localhost:3000/candidate-profile/process-cv \
  -H "Content-Type: application/json" \
  -d '{"version": "v1"}'

# 3. Score all jobs against candidate profile
curl -X POST $AUTH http://localhost:3000/job-scoring/score-all

# 4. Browse scored jobs
curl "$AUTH" "http://localhost:3000/job-scoring/candidate/1?minScore=60&sort=score:desc"
```

---

## Configuration reference

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port the app listens on |
| `NODE_ENV` | `development` | Controls TypeORM query logging (`production` disables it) |
| `APIFY_TOKEN` | — | Required for LinkedIn job scraping |
| `POSTGRES_URL` | — | Full Postgres connection string |
| `POSTGRES_USER` | `app` | Used by Docker Compose to create the DB |
| `POSTGRES_PASSWORD` | `app` | Used by Docker Compose to create the DB |
| `POSTGRES_DB` | `getjob` | Used by Docker Compose to create the DB |
| `REDIS_HOST` | `localhost` | Redis hostname (`redis` inside Docker Compose) |
| `REDIS_PORT` | `6379` | Redis port |
| `OLLAMA_HOST` | `http://localhost:11434` | Base URL of the Ollama API |
| `OLLAMA_MODEL` | `gemma4` | Model name for both CV parsing and job scoring |
| `JWT_SECRET` | — | Secret for signing access tokens (required) |
| `JWT_EXPIRES_IN` | `15m` | Access token TTL (e.g. `15m`, `1h`) |
| `JWT_REFRESH_SECRET` | — | Secret for signing refresh tokens (required) |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `DASHBOARD_URL` | — | Allowed CORS origin for the frontend dashboard |
| `REQUEST_TIMEOUT_MS` | `120000` | HTTP request timeout in milliseconds |

To use a different model, install it via Ollama and update `OLLAMA_MODEL`:

```bash
ollama pull qwen2.5:7b
OLLAMA_MODEL=qwen2.5:7b
```

---

## Running with Docker Compose (full stack)

```bash
cp .env.example .env
# Fill in APIFY_TOKEN in .env

docker compose up --build
```

This starts Postgres, Redis, and the app container together. The app connects to Postgres and Redis using Docker service names automatically.

Note: Ollama runs on your host machine and is not part of the Docker Compose stack. The app container reaches it via `OLLAMA_HOST=http://host.docker.internal:11434` if you need to override the default when running inside Docker.

---

## Database migrations

Migrations live alongside their domain modules:

| Domain | Location |
|---|---|
| Job ingestion | `src/module/job/migrations/` |
| Candidate profile | `src/module/candidate/migrations/` |
| Job scoring | `src/module/job-scoring/migrations/` |
| Users | `src/module/user/migrations/` |
| Candidate applications | `src/module/candidate-application/migrations/` |

All migration files are auto-discovered via a glob pattern — no manual registration required.

```bash
npm run migration:run      # apply pending migrations
npm run migration:revert   # rollback last migration
npm run migration:show     # list applied / pending
npm run migration:generate -- src/module/job/migrations/MyMigration  # auto-generate from entity diff
```

---

## Project structure

See [docs/architecture.md](./docs/architecture.md) for full module details and diagrams.

Quick overview:
- `src/main.ts` — app entry point
- `src/AppModule.ts` — root module: imports all feature modules, configures TypeORM + BullMQ + JWT
- `src/common/` — shared DTOs, interfaces, utilities
- `src/config/` — environment-driven config for Ollama, Postgres, Redis
- `src/module/` — feature modules:
  - `auth/` — JWT guard + strategy
  - `user/` — registration, login, token refresh
  - `job/` — job scraping + lookup tables
  - `candidate/` — candidate profile extraction
  - `candidate-application/` — application tracking
  - `job-scoring/` — scoring with BullMQ queue + WebSocket gateway
  - `ollama/` — LLM integration (CV extraction + job scoring)
  - `apify/` — Apify LinkedIn scraper client
