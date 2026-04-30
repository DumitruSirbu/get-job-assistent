---
description: Module structure, database schema, queue architecture, and WebSocket real-time progress system
globs: "src/**/*.ts"
alwaysApply: false
---

# Architecture

A NestJS backend that scrapes LinkedIn job listings via Apify, normalizes and stores them in PostgreSQL, scores them against candidate profiles using a local Ollama LLM, exposes a dashboard API (filterable job/score listings, candidate profile management, job application tracking), and enforces JWT authentication on all routes.

## Tech Stack

- **Runtime:** Node 22, TypeScript (ES2023, `nodenext` modules)
- **Framework:** NestJS 11 (`@nestjs/common`, `core`, `platform-express`)
- **Database:** PostgreSQL 16 via TypeORM (`synchronize: false`, migrations only)
- **Queue:** BullMQ + Redis 7 (`@nestjs/bullmq`)
- **LLM:** Ollama (local) — CV extraction and job scoring via `fetch` against `/api/chat`
- **WebSocket:** Socket.io (job scraping + job scoring progress)
- **External API:** Apify Client (LinkedIn Jobs Scraper actor)
- **Auth:** JWT (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`); global `JwtAuthGuard`; public routes marked with `@Public()`
- **Infra:** Docker Compose (postgres:16-alpine, redis:7-alpine, app); CORS enabled for `DASHBOARD_URL`

## Module Structure

Each domain (job, candidate, candidate-application, job-scoring, etc.) is a self-contained NestJS module:

```
src/
├── main.ts                         # NestFactory bootstrap, ValidationPipe (global), CORS, REQUEST_TIMEOUT_MS, PORT
├── AppModule.ts                    # Root: ConfigModule (global), TypeORM, BullMQ, APP_GUARD → JwtAuthGuard, imports all feature modules
├── common/
│   ├── dto/PaginationDto.ts        # page + pageSize query params (class-validator)
│   ├── interface/IPaginated.ts     # { items: T[]; total: number; page: number; pageSize: number }
│   └── utils/
├── config/
│   ├── ormconfig.ts                # Postgres config from POSTGRES_URL env
│   ├── typeormDataSource.ts        # DataSource for CLI migrations
│   ├── bullmqConfig.ts             # Redis connection from REDIS_HOST/PORT
│   └── ollamaConfig.ts             # Ollama host + model from env
├── cv/                             # CV text files: cv-<version>.txt
└── module/
    ├── auth/                       # JWT authentication (no entity, no service)
    │   ├── AuthModule.ts
    │   ├── decorator/              # @Public() — marks a route as unauthenticated
    │   ├── guard/                  # JwtAuthGuard
    │   ├── interface/              # IJwtPayload, ITokenResponse
    │   └── strategy/               # JwtStrategy
    ├── user/                       # User registration / login / token refresh
    │   ├── UserModule.ts
    │   ├── controller/
    │   ├── dto/
    │   ├── entity/                 # User (table: users)
    │   ├── repository/
    │   ├── service/                # UserService (bcrypt, JWT, refresh-token rotation)
    │   └── migrations/
    ├── apify/                      # External API integration
    │   ├── ApifyModule.ts
    │   ├── service/                # ApifyLinkedinJobsService
    │   └── interface/
    ├── job/                        # Core job ingestion + lookup module
    │   ├── JobModule.ts
    │   ├── controller/             # JobDescriptionController + lookup endpoints
    │   ├── dto/                    # ListJobFiltersDto
    │   ├── service/                # JobDescriptionService (ETL pipeline)
    │   ├── entity/                 # 8 TypeORM entities
    │   ├── repository/             # BaseRepository + concrete repos
    │   ├── queue/                  # LinkedinJobsProcessor (BullMQ worker)
    │   ├── interface/
    │   ├── const/
    │   └── migrations/
    ├── candidate/                  # Candidate profile module
    │   ├── CandidateModule.ts
    │   ├── controller/
    │   ├── dto/
    │   ├── entity/                 # CandidateProfile
    │   ├── repository/
    │   ├── service/                # CV → Ollama → candidate_profile
    │   └── migrations/
    ├── candidate-application/      # Job application tracking
    │   ├── CandidateApplicationModule.ts
    │   ├── controller/             # CRUD under /candidate-profile/:id/applications
    │   ├── dto/
    │   ├── entity/                 # CandidateApplication, ApplicationStatus
    │   ├── repository/
    │   ├── service/
    │   └── migrations/
    ├── job-scoring/                # Job-to-candidate scoring module
    │   ├── JobScoringModule.ts
    │   ├── controller/
    │   ├── dto/
    │   ├── entity/                 # JobMatchScore, ScorerModel
    │   ├── enum/                   # ScorerTypeEnum, ScorerProviderEnum
    │   ├── gateway/                # WebSocket gateway (Socket.io)
    │   ├── interface/
    │   ├── repository/
    │   ├── queue/                  # JobScoringProcessor (BullMQ worker)
    │   ├── service/                # Scoring logic + snapshot tracking
    │   └── migrations/
    └── ollama/                     # Shared Ollama integration
        ├── OllamaModule.ts
        ├── service/
        │   ├── OllamaBaseService.ts           # Abstract: HTTP + JSON parsing
        │   ├── OllamaCvService.ts             # CV extraction prompt
        │   └── OllamaJobScoringService.ts     # Job scoring prompt
        └── interface/
```

## Module Composition

- **AppModule** — global config, wires TypeORM + BullMQ roots, registers `JwtAuthGuard` as `APP_GUARD`; imports all 8 feature modules
- **AuthModule** — JWT guard/strategy/decorator only; no entity; exports `JwtAuthGuard`
- **UserModule** — User entity + JWT issuance; all routes are `@Public()`
- **ApifyModule** — `APIFY_CLIENT` injection token (factory from ConfigService), exports `ApifyLinkedinJobsService`
- **JobModule** — imports `ApifyModule`, registers all 8 job entities, exports lookup repos
- **OllamaModule** — stateless, no imports; provides and exports `OllamaCvService` and `OllamaJobScoringService`
- **CandidateModule** — imports `OllamaModule` + `JobModule`; exports `CandidateProfileRepository`
- **CandidateApplicationModule** — imports `CandidateModule`; owns `candidate_application` + `application_status` tables
- **JobScoringModule** — imports `OllamaModule` + `JobModule` + `CandidateModule`; owns job-scoring BullMQ queue

## Database Schema

Migrations are managed per-domain in `src/module/*/migrations/`. TypeORM is configured with `synchronize: false` — migrations are applied via `npm run migration:run`.

Key tables:
- `job_description` — scraped LinkedIn jobs
- `candidate_profile` — extracted from CV via Ollama
- `job_match_score` — job scores (0–100) with reasoning + metadata
  - Column `hidden: boolean (default false)` — controls visibility in list views
  - Partial index on `(candidate_profile_id) WHERE hidden = true` for efficient filtering
- `candidate_application` — tracks applied jobs and their status
- `application_status` — lookup: applied, interview, offer, rejected, withdrawn
- Lookup tables: `company`, `location`, `sector`, `speciality`, `contract_type`, `experience_level`, `apply_type`
- Auth: `users` table with bcrypt password hashes + refresh token tracking
- Queue metadata: `scorer_model` (defines which LLM algorithm was used for scoring)

## Job Ingestion Data Flow

```
HTTP trigger (GET /job-description/process-new-jobs)
  → JobDescriptionService.dispatchProcessNewJobs()
    → BullMQ: one job per location (queue: 'linkedin-jobs', job: 'process-location')
      → LinkedinJobsProcessor.process()
        → JobDescriptionService.processJobsByLocation(location)
          → ApifyLinkedinJobsService.fetchJobs() (run LinkedIn Jobs Scraper actor)
          → processGetJobsResults() — ETL pipeline:
              1. Extract unique dimension values from raw results
              2. Bulk upsert missing lookup rows (ON CONFLICT DO NOTHING)
              3. Load all dimension maps (Map<normalizedName, id>)
              4. Map raw items → IJobDescription (resolve FK ids)
              5. Bulk insert job descriptions (dedupe by jobExternalId)
```

## Candidate CV Processing Data Flow

```
HTTP trigger (POST /candidate-profile/process-cv { version })
  → CandidateProfileService.processCV(version)
    → Read src/cv/cv-{version}.txt from filesystem
    → OllamaCvService.extractCvProfile(cvText) → IOllamaCvResponse
    → Resolve locationId and experienceLevelId from DB maps
    → CandidateProfileRepository.upsert(...) → CandidateProfile
```

## Job Scoring Data Flow

```
HTTP trigger (POST /job-scoring/score-newest-jobs/:candidateId { filters })
  → JobScoringService.scoreNewestJobs(...)
    → CandidateProfileRepository.findLatest() — must exist or throws
    → ScorerModelRepository.findOrCreate({ scorerType, scorerProvider, scorerModel })
    → JobDescriptionRepository.findUnscoredByCandidateAndScorer(...) — subquery excludes already-scored
    → jobScoringQueue.addBulk(jobs) (queue: 'job-scoring', job: 'score-job')
      → JobScoringProcessor.process()
        → JobScoringService.processScoreJobEvent({ jobDescriptionId, candidateProfileId })
          → fetch job + candidate profile in parallel
          → ScorerModelRepository.findOrCreate(...)
          → OllamaJobScoringService.scoreJob(input) → { score, reasons }
          → JobMatchScoreRepository.create(...) — skips duplicate key errors gracefully
      → JobScoringGateway emits WebSocket events (started, item_completed, item_failed, finished)
```

## WebSocket Architecture

Two WebSocket gateways broadcast real-time progress:

1. **Job scraping** (`/ws/job-scraping`)
   - Emits: `started`, `location_completed`, `location_failed`, `finished`
   - Used by dashboard to show scraping progress

2. **Job scoring** (`/ws/job-scoring`)
   - Emits: `started`, `item_completed`, `item_failed`, `finished`
   - Snapshots stored in Redis (TTL 24h) for dashboard polling
   - Allows late-joining clients to fetch current state via `GET /job-scoring/scoring-run/:runId/snapshot`

## Queue Design (BullMQ + Redis)

**Job ingestion queue**
- Queue name: `linkedin-jobs`
- Job name: `process-location`
- Job options: `{ attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false }`
- Payload: `{ location: string }`

**Job scoring queue**
- Queue name: `job-scoring`
- Job name: `score-job`
- Payload: `{ jobDescriptionId, candidateProfileId }`
- Worker options: `lockDuration: 10 min` (needed because Ollama scoring can take minutes), `concurrency: 2`
- Snapshots allow late-joining clients to fetch current state via `GET /job-scoring/scoring-run/:runId/snapshot`

## SDK Exports

The shared SDK (`lib/sdk/`) exports:

- **Enums**: `ContractTypeEnum`, `ExperienceLevelEnum`, `JobScoreVisibilityEnum`, `WorkTypeEnum`, `LocationEnum`, etc.
- **DTOs**: `PaginationDto`, `ListJobFiltersDto`, `GetNewJobsParamsDto`
- **Job scoring interfaces**: `IScoreNewestJobsParams`, `IListScoresParams`, `IJobScoreRow`, `IToggleJobScoreVisibilityParams`
- **WebSocket interfaces** (in `lib/sdk/ws/`): event types, enums, payloads

## Key Design Patterns

- **Feature-based organization** under `src/module/<feature>/`
- **Global JWT guard** — `JwtAuthGuard` applied via `APP_GUARD`; use `@Public()` decorator to opt out
- **Constructor injection** everywhere; `@Inject('APIFY_CLIENT')` for factory token; `@InjectQueue` for BullMQ
- **Repository pattern** — abstract `BaseRepository<T>` with `findAll`, `create`, `insertManyIgnoreConflicts`
- **DTOs** for all validated inputs (request body + query params); use `class-validator` + `class-transformer`
- **Barrel exports** — each subfolder has `index.ts` re-exporting its members; exceptions: `repository/` has no barrel
- **No Swagger/OpenAPI** decorators

## Ollama Integration

**OllamaBaseService** (abstract)
- Configured via `ollamaConfig` singleton (`OLLAMA_HOST`, `OLLAMA_MODEL` env vars; defaults: `http://localhost:11434`, `gemma4`)
- `askForJson<T>(prompt)` — POSTs to `/api/chat` with `stream: false`, extracts JSON from response

**OllamaCvService**
- `extractCvProfile(cvText)` → `IOllamaCvResponse`
- Parses: `fullName`, `headline`, `openToRemote`, `email`, `phone`, `linkedinUrl`, `yearsExperience`, `experienceLevel`, `location`, `skills[]`

**OllamaJobScoringService**
- `scoreJob(input: IScoreJobInput)` → `{ score: number; reasons: IOllamaJobScoreReasons }`
- Reasons include: `matchedSkills`, `missingSkills`, `seniorityMatch`, `locationMatch`, `summary`

## See also

- [README.md](../README.md) — setup, dev commands, configuration
- [docs/api.md](./api.md) — full HTTP endpoint reference
- [docs/websocket.md](./websocket.md) — WebSocket events and payloads
- [docs/conventions.md](./conventions.md) — naming, testing, debugging patterns
- [docs/domain-glossary.md](./domain-glossary.md) — domain terminology and rules
