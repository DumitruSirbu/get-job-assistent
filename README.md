# get-job-assistent

A personal NestJS backend that automates the full job-search pipeline: scrape LinkedIn job listings via Apify, extract a structured candidate profile from your CV using a local LLM (Ollama), and score every scraped job against your profile — all stored in PostgreSQL.

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
```

1. **Scrape jobs** — call the Apify LinkedIn Jobs Scraper actor, normalize results, and persist them in `job_description`.
2. **Process CV** — send your CV text to a local Ollama model; it returns structured JSON (skills, experience level, location, etc.) which is saved as a `candidate_profile` record.
3. **Score jobs** — for each unscored job, send the job description + candidate profile to the same Ollama model; it returns a 0–100 match score plus a reasoning breakdown saved in `job_match_score`.

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

The health endpoint uses `GET`. All processing endpoints use `POST`.

### Health check

```
GET /
```

Returns `200 OK` when the service is running.

---

### Job ingestion

#### Scrape new jobs from LinkedIn via Apify

```
POST /job-description/process-new-jobs
```

Dispatches the Apify actor run and fans out results into a BullMQ queue for processing.

Response:
```json
{ "queued": 42 }
```

#### Load jobs from local file (for development/testing)

```
POST /job-description/process-from-file
```

Loads job data from a local JSON file (`src/module/job/jobsList.json`) instead of calling Apify. Useful for offline development.

---

### Candidate profile

#### Process CV and build candidate profile

```
POST /candidate-profile/process-cv
Content-Type: application/json
```

Request body:

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `version` | string | Yes | must match `v\d+` (e.g. `"v1"`, `"v2"`) | Maps to `src/cv/cv-{version}.txt` |

```json
{ "version": "v1" }
```

Reads the CV file, sends it to Ollama, extracts structured data, resolves FK lookups (location, experience level), and upserts a `candidate_profile` record. Returns `400 Bad Request` if `version` is missing or does not match the expected pattern.

**Run this before scoring jobs.**

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

### Job scoring

#### Score all unscored job descriptions

```
POST /job-scoring/score-all
```

Loads the latest candidate profile and scores every job description that has not yet been scored by the current model/version combination. Already-scored jobs are skipped at query level (no reprocessing on repeated calls).

Response:
```json
{ "scored": 17 }
```

Each scored job produces a `job_match_score` record containing:
- `score` — integer 0–100
- `reasonsJson` — matched skills, missing skills, seniority fit, location/remote fit, and a summary sentence
- `metadataJson` — model name and job title for audit purposes

---

## Recommended workflow

```bash
# 1. Ingest jobs (choose one)
curl -X POST http://localhost:3000/job-description/process-new-jobs   # live Apify scrape
curl -X POST http://localhost:3000/job-description/process-from-file  # local file

# 2. Build candidate profile from CV
curl -X POST http://localhost:3000/candidate-profile/process-cv \
  -H "Content-Type: application/json" \
  -d '{"version": "v1"}'

# 3. Score all jobs against candidate profile
curl -X POST http://localhost:3000/job-scoring/score-all
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
├── config/
│   ├── ollamaConfig.ts          # Ollama host + model (reads from env)
│   ├── ormconfig.ts             # Postgres config
│   ├── bullmqConfig.ts          # Redis/BullMQ config
│   └── typeormDataSource.ts     # CLI DataSource for migrations
├── cv/
│   └── cv-v1.txt                # Your CV (plain text)
└── module/
    ├── apify/                   # Apify client + LinkedIn scraper service
    ├── job/                     # Job ingestion: scrape, normalize, persist
    │   ├── entity/
    │   ├── repository/
    │   ├── service/
    │   ├── controller/
    │   ├── queue/               # BullMQ worker
    │   └── migrations/
    ├── candidate/               # Candidate profile domain
    │   ├── entity/
    │   ├── repository/
    │   ├── service/             # CV → Ollama → candidate_profile
    │   ├── controller/
    │   └── migrations/
    ├── job-scoring/             # Job scoring domain
    │   ├── entity/
    │   ├── repository/
    │   ├── service/             # candidate_profile + jobs → Ollama → scores
    │   ├── controller/
    │   ├── enum/                # ScorerTypeEnum, ScorerProviderEnum
    │   └── migrations/
    └── ollama/                  # Shared Ollama LLM integration
        ├── OllamaModule.ts
        ├── service/
        │   ├── OllamaBaseService.ts         # Abstract: HTTP + JSON parsing
        │   ├── OllamaCvService.ts           # CV extraction prompt
        │   └── OllamaJobScoringService.ts   # Job scoring prompt
        └── interface/
            ├── IOllamaChatResponse.ts
            ├── IOllamaCvSkill.ts
            ├── IOllamaCvResponse.ts
            ├── IOllamaJobScoreReasons.ts
            ├── IOllamaJobScoreResponse.ts
            └── IScoreJobInput.ts
```
