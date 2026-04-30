---
description: WebSocket gateways, event subscriptions, and real-time payload schemas for job scraping and scoring
globs: "src/**/gateway/**/*.ts"
alwaysApply: false
---

# WebSocket Events

Two WebSocket gateways broadcast real-time progress during background operations.

## Job Scoring Progress

Connect to `ws://<host>:3000/ws/job-scoring` (or `wss://` for HTTPS) to receive real-time updates during scoring runs triggered by `POST /job-scoring/score-newest-jobs/:candidateId`.

### Subscribe to a Scoring Run

Send from client:

```json
{
  "type": "subscribe",
  "runId": "<uuid from POST response>"
}
```

### Server Events

#### `started` — Scoring run has begun

```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "totalJobs": 42
}
```

Emitted when the background scoring job starts processing.

#### `item_completed` — A job was successfully scored

```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "jobDescriptionId": 123,
  "score": 78,
  "completedItems": 5,
  "totalJobs": 42
}
```

Emitted once for each job that completes scoring. Update your progress bar: `completedItems / totalJobs`.

#### `item_failed` — Scoring a job failed

```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "jobDescriptionId": 456,
  "error": "Model timeout",
  "completedItems": 5,
  "failedItems": 1,
  "totalJobs": 42
}
```

Emitted when Ollama times out or another error occurs during scoring. The job is not retried; the run continues with remaining jobs.

#### `finished` — Scoring run completed

```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success" | "partial" | "fail",
  "completedItems": 40,
  "failedItems": 2,
  "totalJobs": 42
}
```

Emitted when the entire run finishes. Refresh your scored jobs list.

**Status values:**
- `success` — all jobs scored (`failedItems === 0`)
- `partial` — some jobs scored, some failed (`0 < failedItems < totalJobs`)
- `fail` — all jobs failed (`failedItems === totalJobs`)

### Late-Join Polling

If a client connects after scoring has already started or finished, they can fetch the current snapshot without WebSocket:

```
GET /job-scoring/scoring-run/:runId/snapshot
```

Returns the same counters as the `started` and `finished` events plus a list of completed/failed items.

---

## Job Scraping Progress

Connect to `ws://<host>:3000/ws/job-scraping` (or `wss://` for HTTPS) to receive real-time updates during job scraping runs triggered by `POST /job-description/process-new-jobs`.

### Subscribe to a Scraping Run

Send from client:

```json
{
  "type": "subscribe",
  "runId": "<uuid>"
}
```

### Server Events

#### `started` — Scraping has begun

```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "totalLocations": 5
}
```

#### `location_completed` — A location has been scraped

```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "location": "Luxembourg",
  "jobsInserted": 18,
  "completedLocations": 1,
  "totalLocations": 5
}
```

#### `location_failed` — Scraping a location failed

```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "location": "Germany",
  "error": "Apify API error",
  "completedLocations": 1,
  "failedLocations": 1,
  "totalLocations": 5
}
```

#### `finished` — Scraping completed

```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success" | "partial" | "fail",
  "totalJobsInserted": 42,
  "completedLocations": 4,
  "failedLocations": 1,
  "totalLocations": 5
}
```

---

## Snapshot Storage

Job scoring run snapshots are stored in Redis with a 24-hour TTL. This allows dashboard clients to fetch the current state of a run via `GET /job-scoring/scoring-run/:runId/snapshot` if they lose their WebSocket connection or navigate away and back.

---

## See also

- [docs/api.md](./api.md) — endpoints that trigger WebSocket events
- [docs/architecture.md](./architecture.md) — WebSocket gateway implementation details
- [README.md](../README.md) — full setup guide
