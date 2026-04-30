---
description: Domain terminology, business rules, and data flow concepts for job ingestion, scoring, and candidate management
globs: "src/module/job/**,src/module/job-scoring/**,src/module/candidate-application/**"
alwaysApply: false
---

# Domain Glossary

## Job Ingestion Data Flow

**Flow:**
```
HTTP trigger (GET /job-description/process-new-jobs)
  → JobDescriptionService.dispatchProcessNewJobs()
    → BullMQ: one job per location (queue: 'linkedin-jobs', job: 'process-location')
      → LinkedinJobsProcessor.process()
        → JobDescriptionService.processJobsByLocation(location)
          → ApifyLinkedinJobsService.fetchJobs() (run LinkedIn Jobs Scraper actor)
          → processGetJobsResults() — ETL pipeline
```

**Terminology:**

- **Apify Actor**: LinkedIn Jobs Scraper — external service that pulls job listings from LinkedIn
- **ETL Pipeline**: Extract → Transform → Load process that normalizes raw Apify results into structured DB records
- **Dimension Upsert**: Each lookup table (company, sector, speciality, etc.) is populated by extracting unique values from raw results, normalizing them, and bulk-upserting with ON CONFLICT DO NOTHING
- **FK Resolution**: After upsert, dimension maps (`Map<normalizedName, id>`) are loaded and used to resolve foreign key IDs in the job records
- **Job External ID**: `job_external_id` — unique identifier from LinkedIn; used for deduplication (ON CONFLICT DO NOTHING)

**Key Entities:**

- `JobDescription` — a scraped LinkedIn job listing
- `Company`, `Location`, `Sector`, `Speciality`, `ContractType`, `ExperienceLevel`, `ApplyType` — lookup dimensions
- `jobExternalId` — unique string ID from LinkedIn (stored as bigint in DB)

**Deduplication:** In-memory via `Map<jobExternalId, IJobDescription>` before insert; in DB via `ON CONFLICT DO NOTHING` on `jobExternalId`.

---

## Candidate CV Processing Data Flow

**Flow:**
```
HTTP trigger (POST /candidate-profile/process-cv { version })
  → CandidateProfileService.processCV(version)
    → Read src/cv/cv-{version}.txt from filesystem
    → OllamaCvService.extractCvProfile(cvText) → IOllamaCvResponse
    → Resolve locationId and experienceLevelId from DB maps
    → CandidateProfileRepository.upsert(...) → CandidateProfile
```

**Terminology:**

- **CV Version**: Filename-based versioning (e.g., `cv-v1.txt` → `version: "v1"`)
- **Candidate Profile**: Structured representation of a job seeker, extracted from raw CV text
- **Skills JSON**: JSONB array of skills with name, level (beginner/intermediate/advanced), and confidence score

**Key Entities:**

- `CandidateProfile` — a job seeker with extracted skills, experience level, and location preference
- Skills are stored as `skillsJson: { name, level, confidence }[]`
- CV version is stored for tracking (allows multiple CV versions to be processed and compared)

---

## Job Scoring Data Flow

**Flow:**
```
HTTP trigger (POST /job-scoring/score-newest-jobs/:candidateId { filters })
  → JobScoringService.scoreNewestJobs(...)
    → CandidateProfileRepository.findLatest() — must exist or throws
    → ScorerModelRepository.findOrCreate({ scorerType, scorerProvider, scorerModel })
    → JobDescriptionRepository.findUnscoredByCandidateAndScorer(...) — subquery excludes already-scored
    → jobScoringQueue.addBulk(jobs) (queue: 'job-scoring', job: 'score-job')
      → JobScoringProcessor.process()
        → JobScoringService.processScoreJobEvent(...)
          → OllamaJobScoringService.scoreJob(input) → { score, reasons }
          → JobMatchScoreRepository.create(...) — skips duplicate key errors gracefully
      → JobScoringGateway emits WebSocket events
```

**Terminology:**

- **Scorer Model**: Metadata describing which LLM/algorithm was used (provider: ollama, model: gemma4, type: llm)
- **Job Match Score**: A 0–100 compatibility score between a job and a candidate
- **Scoring Run**: A bulk operation triggered by the user; identified by `runId` (UUID); tracked via WebSocket
- **Unscored Job**: A job that has no match score for the current candidate + scorer combination
- **Visibility Flag**: `hidden: boolean` on `JobMatchScore` — allows users to hide irrelevant scores from the list view

**Key Entities:**

- `ScorerModel` — identifies the scoring algorithm (unique on `scorerProvider + scorerModel`)
- `JobMatchScore` — links job → candidate → scorer; unique on `(jobDescriptionId, candidateProfileId, scorerModelId, version)`
- Partial index on `(candidate_profile_id) WHERE hidden = true` for efficient filtering of hidden scores

**Scoring Algorithm:**
- Ollama LLM is prompted with job description and candidate profile
- Returns: `score` (0–100), `reasonsJson` (matched skills, missing skills, seniority fit, location fit, summary)
- Sequential logic with early-stop on location/title mismatch

**Error Handling in Scoring:**
- Duplicate key inserts (same job + candidate + scorer) are caught and logged as warnings (no rethrow)
- This allows re-runs of the same scoring without crashing

---

## Candidate Application Domain

**Flow:**
```
HTTP trigger (POST /candidate-profile/:candidateProfileId/applications)
  → CandidateApplicationService.createApplication(candidateProfileId, dto)
    → assertCandidateExists() — 404 if profile not found
    → ApplicationStatusRepository.findByName(statusName ?? 'applied')
    → CandidateApplicationRepository.saveEntity(entity)
```

**Terminology:**

- **Application**: A job application attempt; links a candidate to a job with a status and timestamp
- **Application Status**: Enum-like lookup values (applied, interview, offer, rejected, withdrawn)
- **Unique Constraint**: Each candidate can only apply to a job once; attempting a duplicate insert fails

**Key Entities:**

- `CandidateApplication` — tracks job applications per candidate
- `ApplicationStatus` — seeded lookup (not upserted at runtime); values: applied, interview, offer, rejected, withdrawn
- `appliedAt` — timestamp (defaults to CURRENT_TIMESTAMP, overridable via DTO)

**Application Lifecycle:**
1. User applies to a job → status = `applied`
2. User gets interview → status = `interview`
3. User gets offer → status = `offer` OR rejects → status = `rejected`
4. User may withdraw → status = `withdrawn`

---

## Apify Integration

**Entity:** `ApifyLinkedinJobsService`

**Input Parameters** (`IGetLinkedinJobsParams`):
- `location` (required) — country/region name
- `contractType` (optional) — full-time, part-time, contract, etc.
- `experienceLevel` (optional) — entry-level, mid-senior, director, etc.
- `workType` (optional) — on-site, remote, hybrid
- `publishedAt` (optional) — past 24 hours, past week, past month
- `rows` (optional) — max results
- `proxy` (optional) — proxy URL for Apify

**Output:** `IJobDescriptionResponse[]` — flat records with string-heavy fields (IDs as strings, raw field names from LinkedIn)

**APIFY_CLIENT:** Factory-injected `ApifyClient` instance from `ApifyModule`

**Actor:** `ApifyActorsEnum.LINKEDIN_JOBS_SCRAPER`

---

## ETL Pipeline Details

### Dimension Upsert Pattern

For each lookup dimension (sector, speciality, contractType, experienceLevel, applyType, location, company):

1. Extract unique values from raw results via `Set`
2. Normalize strings: `normalizeStringValue()` = `trim().toLowerCase()`
3. Call `repository.insertNew<Dimension>(values)` → `insertManyIgnoreConflicts` (ON CONFLICT DO NOTHING)
4. After all inserts, reload all maps via `repository.findAllAndMap()` → `Map<normalizedName, id>`

### FK Resolution

`assignIdIfExists<K extends keyof IJobDescription>(item, map, rawValue, field)` — looks up `normalizeStringValue(rawValue)` in the map, sets `item[field]` if found.

### Deduplication

- **In-memory**: `Map<jobExternalId, IJobDescription>` before insert
- **In DB**: `ON CONFLICT DO NOTHING` via `insertManyIgnoreConflicts`
- **Partial Inserts**: Items missing required FKs (company, applyType, contractType, experienceLevel, speciality, sector) are skipped

---

## Queue Configuration

### LinkedIn Jobs Queue

- **Queue name:** `LINKEDIN_JOBS_QUEUE = 'linkedin-jobs'`
- **Job name:** `LINKEDIN_JOBS_JOB_NAME = 'process-location'`
- **Retry**: `{ attempts: 3, backoff: { type: 'exponential', delay: 5000 } }`
- **Cleanup**: `removeOnComplete: true, removeOnFail: false`
- **Payload:** `{ location: string }`
- **Locations:** hardcoded in `JobDescriptionService` as a private array

### Job Scoring Queue

- **Queue name:** `JOB_SCORING_QUEUE = 'job-scoring'`
- **Job name:** `JOB_SCORING_JOB_NAME = 'score-job'`
- **Payload:** `{ jobDescriptionId, candidateProfileId }`
- **Worker options:** `lockDuration: 10 * 60 * 1000` (10 min, needed because Ollama can take minutes), `stalledInterval: 30_000`, `maxStalledCount: 1`, `concurrency: 2`
- **Batch Dispatch:** `queue.addBulk()` for all unscored jobs

---

## Ollama Integration

**OllamaBaseService** (abstract)
- Configured via `ollamaConfig` singleton (`OLLAMA_HOST`, `OLLAMA_MODEL` env vars)
- Defaults: `http://localhost:11434`, `gemma4`
- `askForJson<T>(prompt)` — POSTs to `/api/chat` with `stream: false`, extracts JSON from response

**OllamaCvService**
- `extractCvProfile(cvText)` → `IOllamaCvResponse`
- Parses: fullName, headline, openToRemote, email, phone, linkedinUrl, yearsExperience, experienceLevel, location, skills[]

**OllamaJobScoringService**
- `scoreJob(input: IScoreJobInput)` → `{ score: number; reasons: IOllamaJobScoreReasons }`
- Reasons: matchedSkills[], missingSkills[], seniorityMatch, locationMatch, summary

---

## Company Blacklist Feature

**Entities:**
- `Company` — now has `isBlacklisted: boolean (default false)` column

**Behavior:**
- `CompanyRepository.findAllAndMap()` returns **only non-blacklisted** companies
- During job processing, lookup resolution skips blacklisted companies
- Blacklisted company jobs are naturally excluded from insert
- New endpoints: `PATCH /company/:id/blacklist` and `PATCH /company/:id/unblacklist`

---

## Scoring Visibility Feature

**Entities:**
- `JobMatchScore` — now has `hidden: boolean (default false)` column

**API:**
- `GET /job-scoring/candidate/:candidateId?visibility=visible|hidden|all`
  - `visible` (default) — only scores with `hidden = false`
  - `hidden` — only scores with `hidden = true`
  - `all` — all scores regardless of hidden flag
- `PATCH /job-scoring/scores/:id/visibility { hidden }`

**UI Pattern:**
- List filters via `visibility` param
- Per-row toggle via eye/eye-off icon
- Partial index on `(candidate_profile_id) WHERE hidden = true` for performance

---

## Authentication & Authorization

**Auth Flow:**
- `POST /user/register` → create account, issue tokens
- `POST /user/login` → authenticate, issue tokens
- `POST /user/refresh` → rotate refresh token, issue new access token
- **Access token**: in-memory only (15m TTL)
- **Refresh token**: stored server-side hash, sessionStorage on client (7d TTL)
- **Global Guard**: `JwtAuthGuard` applied via `APP_GUARD`; public routes marked with `@Public()`

**Token Rotation:**
- Refresh endpoint accepts old refresh token, returns new access token
- Old refresh token is invalidated (new hash stored)
- Client must update stored refresh token

---

## See also

- [docs/architecture.md](./architecture.md) — module structure and infrastructure
- [docs/api.md](./api.md) — HTTP endpoint reference
- [docs/websocket.md](./websocket.md) — real-time event schemas
- [docs/conventions.md](./conventions.md) — code style and patterns
