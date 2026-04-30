# @dumitrusirbu/get-job-assistant-sdk

Shared enums, DTOs and utilities for the get-job-assistant ecosystem. Used by both the backend API and the Dashboard.

## Installation

```bash
npm install @dumitrusirbu/get-job-assistant-sdk
```

### Peer dependencies

```bash
npm install class-validator class-transformer reflect-metadata
```

## Contents

### Enums

| Enum | Values |
|------|--------|
| `ContractTypeEnum` | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `TEMPORARY`, `INTERNSHIP`, `VOLUNTEER` |
| `ExperienceLevelEnum` | `INTERNSHIP`, `ENTRY_LEVEL`, `ASSOCIATE`, `MID_SENIOR`, `DIRECTOR` |
| `PublishedAtEnum` | `PAST_24_HOURS`, `PAST_WEEK`, `PAST_MONTH` |
| `WorkTypeEnum` | `ON_SITE`, `REMOTE`, `HYBRID` |
| `LocationEnum` | `LUXEMBOURG`, `EUROPE` |
| `LanguageLevelEnum` | `NATIVE`, `FLUENT`, `CONVERSATIONAL`, `BASIC` |
| `SkillLevelEnum` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT` |
| `JobScoreVisibilityEnum` | `VISIBLE`, `HIDDEN`, `ALL` |

### DTOs

| DTO | Description |
|-----|-------------|
| `PaginationDto` | Base pagination class with `page` and `limit` fields |
| `ListJobFiltersDto` | Filters and pagination for querying job listings |
| `GetNewJobsParamsDto` | Parameters for triggering a new job fetch (title, location, contract type, etc.) |

### Job Scoring Interfaces

| Interface | Description |
|-----------|-------------|
| `IScoreNewestJobsParams` | Parameters for scoring a subset of jobs (titleKeyword, limit, publishedFrom, publishedTo) |
| `IListScoresParams` | Filters for listing job scores (minScore, visibility, companyId, applicationStatusId, etc.) |
| `IJobScoreRow` | A scored job record (id, jobId, score, hidden, createdAt, updatedAt) |
| `IToggleJobScoreVisibilityParams` | Request to toggle score visibility (id, hidden) |
| `IToggleJobScoreVisibilityResponse` | Response from visibility toggle (extends IJobScoreRow) |

## Usage

```typescript
import {
  ContractTypeEnum,
  ExperienceLevelEnum,
  LocationEnum,
  PublishedAtEnum,
  WorkTypeEnum,
  JobScoreVisibilityEnum,
  GetNewJobsParamsDto,
  ListJobFiltersDto,
  IScoreNewestJobsParams,
  IListScoresParams,
  IJobScoreRow,
  IToggleJobScoreVisibilityParams,
  IToggleJobScoreVisibilityResponse,
} from '@dumitrusirbu/get-job-assistant-sdk';
```

## Publishing

```bash
# Build
npm run sdk:build

# Dry run (preview without publishing)
npm run sdk:publish:dry

# Publish to npmjs.com
npm run sdk:publish
```
