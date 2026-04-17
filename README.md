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

## API endpoints

All endpoints except the authentication routes require a valid JWT `Authorization: Bearer <token>` header.

---

### Authentication

All auth endpoints are public (no token required).

#### Register

```
POST /user/register
Content-Type: application/json
```

```json
{ "email": "you@example.com", "firstName": "Ada", "lastName": "Lovelace", "password": "s3cr3t" }
```

Returns `{ accessToken, refreshToken }`.

#### Login

```
POST /user/login
Content-Type: application/json
```

```json
{ "email": "you@example.com", "password": "s3cr3t" }
```

Returns `{ accessToken, refreshToken }`.

#### Refresh token

```
POST /user/refresh
Content-Type: application/json
```

```json
{ "refreshToken": "<your_refresh_token>" }
```

Returns `{ accessToken }` and rotates the stored refresh token.

---

### Health check

```
GET /
```

Returns `200 OK` when the service is running.

---

### Job ingestion

#### List jobs

```
GET /job-description
```

Paginated and filterable. Query params:

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default 1) |
| `pageSize` | number | Items per page (default 20) |
| `search` | string | Full-text search on job title / description |
| `publishedFrom` | string | ISO date — filter jobs published on or after |
| `publishedTo` | string | ISO date — filter jobs published on or before |
| `companyId` | number \| number[] | Filter by company id(s) |
| `locationId` | number \| number[] | Filter by location id(s) |
| `sectorId` | number \| number[] | Filter by sector id(s) |
| `specialityId` | number \| number[] | Filter by speciality id(s) |
| `experienceLevelId` | number \| number[] | Filter by experience level id(s) |
| `contractTypeId` | number \| number[] | Filter by contract type id(s) |
| `applyTypeId` | number \| number[] | Filter by apply type id(s) |
| `sort` | `publishedAt:desc` \| `publishedAt:asc` | Sort order (default `publishedAt:desc`) |

#### Get job by id

```
GET /job-description/:id
```

#### Scrape new jobs from LinkedIn via Apify

```
POST /job-description/process-new-jobs
```

Response: `{ "queued": 42 }`

#### Load jobs from local file (for development/testing)

```
POST /job-description/process-from-file
```

Loads job data from `src/module/job/jobsList.json`. Useful for offline development.

---

### Lookup tables

`GET /company` returns a paginated response (`{ items, total, page, limit }`) and supports `search` by name and optional `isBlacklisted` filtering.  
All other lookup endpoints return `{ items: [{ id, name }] }`.

```
GET /apply-type
GET /company?page=1&limit=20&search=google&isBlacklisted=true
GET /contract-type
GET /experience-level
GET /location
GET /sector
GET /speciality
```

---

### Candidate profile

#### List profiles

```
GET /candidate-profile?page=1&pageSize=20
```

#### Get profile by id

```
GET /candidate-profile/:id
```

#### Process CV and build candidate profile

```
POST /candidate-profile/process-cv
Content-Type: application/json
```

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `version` | string | Yes | must match `v\d+` (e.g. `"v1"`, `"v2"`) | Maps to `src/cv/cv-{version}.txt` |

```json
{ "version": "v1" }
```

Reads the CV file, sends it to Ollama, extracts structured data, resolves FK lookups (location, experience level), and upserts a `candidate_profile` record. **Run this before scoring jobs.**

Example response (truncated):
```json
{
  "candidateProfileId": 1,
  "fullName": "Dumitru Sirbu",
  "headline": "Senior Software Engineer · Full-Stack",
  "openToRemote": true,
  "yearsExperience": 13,
  "skillsJson": [
    { "name": "nestjs", "level": "advanced", "confidence": 0.95 },
    { "name": "typescript", "level": "advanced", "confidence": 0.95 },
    { "name": "mongodb", "level": "advanced", "confidence": 0.9 }
  ]
}
```

---

### Candidate applications

Track jobs you have applied to, scoped to a candidate profile.

#### List applications

```
GET /candidate-profile/:candidateProfileId/applications
```

#### Create application

```
POST /candidate-profile/:candidateProfileId/applications
Content-Type: application/json
```

| Field | Type | Required | Description |
|---|---|---|---|
| `jobDescriptionId` | number | Yes | Job to apply for |
| `statusName` | string | No | Status name (default `applied`); one of `applied`, `interview`, `offer`, `rejected`, `withdrawn` |
| `appliedAt` | string | No | ISO timestamp — defaults to now |

#### Get application

```
GET /candidate-profile/:candidateProfileId/applications/:applicationId
```

#### Update application

```
PATCH /candidate-profile/:candidateProfileId/applications/:applicationId
Content-Type: application/json
```

| Field | Type | Required | Description |
|---|---|---|---|
| `statusName` | string | No | New status name |
| `appliedAt` | string | No | New applied date |

#### Delete application

```
DELETE /candidate-profile/:candidateProfileId/applications/:applicationId
```

Returns `204 No Content`.

---

### Job scoring

#### List scores for a candidate

```
GET /job-scoring/candidate/:candidateId
```

Query params:

| Param | Type | Description |
|---|---|---|
| `page` / `pageSize` | number | Pagination |
| `minScore` | number | Minimum score (0–100) |
| `locationMatch` | boolean | Filter to location-matched jobs only |
| `search` | string | Search in job title |
| `sort` | `score:desc` \| `score:asc` \| `publishedAt:desc` | Sort order (default `score:desc`) |
| `scoredFrom` | string | Date filter `YYYY-MM-DD` |
| `scoredTo` | string | Date filter `YYYY-MM-DD` |

#### Score all unscored job descriptions

```
POST /job-scoring/score-all
```

Loads the latest candidate profile and scores every job not yet scored by the current model/version. Returns `{ "scored": 17 }`.

Each `job_match_score` record contains:
- `score` — integer 0–100
- `reasonsJson` — matched skills, missing skills, seniority fit, location/remote fit, summary sentence
- `metadataJson` — model name and job title

#### Clear scoring queue

```
POST /job-scoring/clear-queue
```

Returns `{ "cleared": true }`.

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

```
src/
├── main.ts
├── AppModule.ts
├── common/
│   ├── dto/PaginationDto.ts     # Shared pagination query params
│   ├── interface/IPaginated.ts  # Paginated response shape
│   └── utils/toArray.ts         # class-transformer array coercion helper
├── config/
│   ├── ollamaConfig.ts          # Ollama host + model (reads from env)
│   ├── ormconfig.ts             # Postgres config
│   ├── bullmqConfig.ts          # Redis/BullMQ config
│   └── typeormDataSource.ts     # CLI DataSource for migrations
├── cv/
│   └── cv-v1.txt                # Your CV (plain text)
└── module/
    ├── auth/                    # JWT guard, strategy, @Public() decorator
    ├── user/                    # Registration, login, refresh token
    │   ├── entity/              # User (table: users)
    │   ├── service/             # UserService (bcrypt + JWT)
    │   ├── controller/          # POST /user/register|login|refresh
    │   └── migrations/
    ├── apify/                   # Apify client + LinkedIn scraper service
    ├── job/                     # Job ingestion: scrape, normalize, persist; lookup endpoints
    │   ├── entity/
    │   ├── repository/
    │   ├── service/
    │   ├── controller/          # JobDescriptionController + 7 lookup controllers
    │   ├── dto/                 # ListJobFiltersDto
    │   ├── queue/               # BullMQ worker
    │   └── migrations/
    ├── candidate/               # Candidate profile domain
    │   ├── entity/
    │   ├── repository/
    │   ├── service/             # CV → Ollama → candidate_profile
    │   ├── controller/
    │   └── migrations/
    ├── candidate-application/   # Job application tracking
    │   ├── entity/              # CandidateApplication, ApplicationStatus
    │   ├── repository/
    │   ├── service/
    │   ├── controller/          # CRUD under /candidate-profile/:id/applications
    │   └── migrations/
    ├── job-scoring/             # Job scoring domain
    │   ├── entity/
    │   ├── repository/
    │   ├── service/             # candidate_profile + jobs → Ollama → scores
    │   ├── controller/
    │   ├── dto/                 # ListScoresRequestDto
    │   ├── enum/                # ScorerTypeEnum, ScorerProviderEnum
    │   └── migrations/
    └── ollama/                  # Shared Ollama LLM integration
        ├── OllamaModule.ts
        ├── service/
        │   ├── OllamaBaseService.ts         # Abstract: HTTP + JSON parsing
        │   ├── OllamaCvService.ts           # CV extraction prompt
        │   └── OllamaJobScoringService.ts   # Job scoring prompt
        └── interface/
```
