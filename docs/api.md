---
description: Complete HTTP API endpoint reference for all routes, DTOs, and response shapes
globs: "src/**/controller/**/*.ts,src/**/dto/**/*.ts"
alwaysApply: false
---

# API Reference

All endpoints except authentication require a valid JWT `Authorization: Bearer <token>` header.

## Authentication

All auth endpoints are public (no token required).

### Register

```
POST /user/register
Content-Type: application/json
```

**Request**
```json
{
  "email": "you@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "password": "s3cr3t"
}
```

**Response** (201)
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Login

```
POST /user/login
Content-Type: application/json
```

**Request**
```json
{
  "email": "you@example.com",
  "password": "s3cr3t"
}
```

**Response** (200)
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Refresh Token

```
POST /user/refresh
Content-Type: application/json
```

**Request**
```json
{
  "refreshToken": "<your_refresh_token>"
}
```

**Response** (200)
```json
{
  "accessToken": "eyJhbGc..."
}
```

The refresh token is rotated server-side; the new refresh token is stored, and the old one is invalidated.

---

## Health Check

```
GET /
```

Returns `200 OK` when the service is running.

---

## Job Ingestion

### List Jobs

```
GET /job-description
```

Paginated and filterable response:
```json
{
  "items": [{ "jobDescriptionId": 1, "jobTitle": "...", ... }],
  "total": 500,
  "page": 1,
  "pageSize": 20
}
```

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number (1-indexed) |
| `pageSize` | number | 20 | Items per page (max 100) |
| `search` | string | — | Full-text search on job title / description |
| `publishedFrom` | string | — | ISO date — filter jobs published on or after |
| `publishedTo` | string | — | ISO date — filter jobs published on or before |
| `companyId` | number \| number[] | — | Filter by company id(s) |
| `locationId` | number \| number[] | — | Filter by location id(s) |
| `sectorId` | number \| number[] | — | Filter by sector id(s) |
| `specialityId` | number \| number[] | — | Filter by speciality id(s) |
| `experienceLevelId` | number \| number[] | — | Filter by experience level id(s) |
| `contractTypeId` | number \| number[] | — | Filter by contract type id(s) |
| `applyTypeId` | number \| number[] | — | Filter by apply type id(s) |
| `sort` | string | `publishedAt:desc` | `publishedAt:desc` or `publishedAt:asc` |

### Get Job by ID

```
GET /job-description/:id
```

Returns a single job object.

### Scrape New Jobs from LinkedIn via Apify

```
POST /job-description/process-new-jobs
```

Triggers background job scraping via BullMQ. Returns immediately.

**Response** (200)
```json
{
  "queued": 42
}
```

### Load Jobs from Local File (dev/testing)

```
POST /job-description/process-from-file
```

Loads job data from `src/module/job/jobsList.json`. Useful for offline development.

---

## Lookup Tables

All lookup endpoints return `{ items: [{ id, name }] }` unless noted otherwise.

| Method | Path | Description |
|---|---|---|
| GET | `/apply-type` | Apply type options |
| GET | `/contract-type` | Contract type options |
| GET | `/experience-level` | Experience level options |
| GET | `/location` | Location/country options |
| GET | `/sector` | Sector/industry options |
| GET | `/speciality` | Job speciality options |

### Company Lookup (with blacklist support)

```
GET /company
```

Paginated response with blacklist status:
```json
{
  "items": [
    { "companyId": 1, "companyName": "Acme Corp", "isBlacklisted": false },
    { "companyId": 2, "companyName": "Evil Inc", "isBlacklisted": true }
  ],
  "total": 2,
  "page": 1,
  "limit": 20
}
```

**Query Parameters**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (default 20, max 100) |
| `search` | string | Partial match on company name |
| `isBlacklisted` | boolean | Filter by blacklist status (`true` or `false`) |

### Blacklist a Company

```
PATCH /company/:id/blacklist
```

Returns `204 No Content`.

### Remove Company from Blacklist

```
PATCH /company/:id/unblacklist
```

Returns `204 No Content`.

---

## Candidate Profile

### List Profiles

```
GET /candidate-profile
```

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `pageSize` | number | 20 | Items per page |

### Get Profile by ID

```
GET /candidate-profile/:id
```

### Process CV and Build Candidate Profile

```
POST /candidate-profile/process-cv
Content-Type: application/json
```

**Request**

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `version` | string | Yes | must match `v\d+` (e.g. `v1`, `v2`) | Maps to `src/cv/cv-{version}.txt` |

```json
{
  "version": "v1"
}
```

Reads the CV file, sends it to Ollama, extracts structured data, resolves FK lookups (location, experience level), and upserts a `candidate_profile` record. **Run this before scoring jobs.**

**Response** (201)
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

## Candidate Applications

Track jobs you have applied to, scoped to a candidate profile.

### List Applications

```
GET /candidate-profile/:candidateProfileId/applications
```

### Create Application

```
POST /candidate-profile/:candidateProfileId/applications
Content-Type: application/json
```

**Request**

| Field | Type | Required | Description |
|---|---|---|---|
| `jobDescriptionId` | number | Yes | Job to apply for |
| `statusName` | string | No | Status name (default `applied`); one of `applied`, `interview`, `offer`, `rejected`, `withdrawn` |
| `appliedAt` | string | No | ISO timestamp — defaults to now |

### Get Application

```
GET /candidate-profile/:candidateProfileId/applications/:applicationId
```

### Update Application

```
PATCH /candidate-profile/:candidateProfileId/applications/:applicationId
Content-Type: application/json
```

**Request**

| Field | Type | Required | Description |
|---|---|---|---|
| `statusName` | string | No | New status name |
| `appliedAt` | string | No | New applied date (ISO timestamp) |

### Delete Application

```
DELETE /candidate-profile/:candidateProfileId/applications/:applicationId
```

Returns `204 No Content`.

---

## Job Scoring

### List Scores for a Candidate

```
GET /job-scoring/candidate/:candidateId
```

Paginated and filterable response:
```json
{
  "items": [
    {
      "jobMatchScoreId": 1,
      "jobDescriptionId": 123,
      "score": 85,
      "reasonsJson": { "matchedSkills": [...], "missingSkills": [...], ... },
      "hidden": false,
      "createdAt": "2026-04-29T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` / `pageSize` | number | 1 / 20 | Pagination |
| `minScore` | number | — | Minimum score (0–100) |
| `locationMatch` | boolean | — | Filter to location-matched jobs only |
| `search` | string | — | Search in job title |
| `sort` | string | `score:desc` | `score:desc`, `score:asc`, or `publishedAt:desc` |
| `scoredFrom` | string | — | Date filter `YYYY-MM-DD` |
| `scoredTo` | string | — | Date filter `YYYY-MM-DD` |
| `applicationStatusId` | number \| number[] | — | Filter by application status |
| `noApplication` | boolean | — | Filter to jobs with no application |
| `companyId` | number \| number[] | — | Filter by company id(s) |
| `visibility` | enum | `visible` | Filter by visibility: `visible` (hidden=false), `hidden` (hidden=true), or `all` |

### Score Newest Jobs for a Candidate

```
POST /job-scoring/score-newest-jobs/:candidateId
Content-Type: application/json
```

Scores a subset of unscored jobs matching optional criteria. Returns immediately with a `runId` for tracking progress via WebSocket.

**Request** (all optional)

```json
{
  "titleKeyword": "python",
  "limit": 50,
  "publishedFrom": "2026-04-20",
  "publishedTo": "2026-04-30"
}
```

**Response** (200)
```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Use the `runId` to subscribe to WebSocket progress events (see [docs/websocket.md](./websocket.md)).

### Score All Unscored Job Descriptions (deprecated)

```
POST /job-scoring/score-all
```

Loads the latest candidate profile and scores every job not yet scored by the current model/version. **Use `POST /job-scoring/score-newest-jobs/:candidateId` instead for real-time progress.**

**Response** (200)
```json
{
  "scored": 17
}
```

### Get Scoring Run Snapshot

```
GET /job-scoring/scoring-run/:runId/snapshot
```

Fetch the current snapshot of an ongoing or completed scoring run. Allows late-joining clients to get current state without WebSocket.

**Response** (200)
```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "totalJobs": 42,
  "completedItems": 35,
  "failedItems": 0,
  "status": "running"
}
```

### Toggle Score Visibility

```
PATCH /job-scoring/scores/:id/visibility
Content-Type: application/json
```

Toggle the `hidden` flag on a job match score.

**Request**

```json
{
  "hidden": true
}
```

**Response** (200)

Returns the updated score record with `hidden` field.

### Clear Scoring Queue

```
POST /job-scoring/clear-queue
```

Returns `200 OK`.

```json
{
  "cleared": true
}
```

---

## See also

- [README.md](../README.md) — setup, dev commands, configuration
- [docs/websocket.md](./websocket.md) — real-time WebSocket events
- [docs/architecture.md](./architecture.md) — module structure and data flows
- [docs/conventions.md](./conventions.md) — naming and code patterns
