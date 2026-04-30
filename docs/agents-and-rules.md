# Agents, Commands, and Rules

Catalog of the AI agents, CLI commands, and rules available to this project.

## Subagents (`~/.claude/agents/`)

| Agent | Role | When to use |
|---|---|---|
| `gja-architect` | Orchestration, planning, high-level design decisions | Breaking down large features, planning module structure, refactoring scope |
| `gja-backend-nestjs` | NestJS implementation, controller/service/repository logic | Feature implementation, bug fixes, API changes |
| `gja-frontend-react` | React UI implementation, component design, state management | Dashboard feature implementation, UI/UX fixes |
| `gja-sdk-maintainer` | SDK exports, type definitions, cross-repo compatibility | Adding new enums/DTOs, versioning, publishing |
| `gja-devops` | Infrastructure, Docker, deployment, CI/CD | Deployment changes, docker-compose updates, env vars |
| `gja-qa-engineer` | Test coverage, quality assurance, test automation | Test writing, coverage analysis, test strategy |
| `gja-scribe` | Documentation, README updates, doc organization | Syncing docs with code, keeping CLAUDE.md/README current |
| `gja-review-logic` | Code review for business logic correctness | Reviewing domain logic, ETL pipelines, scoring algorithms |
| `gja-review-performance` | Code review for performance and optimization | Query optimization, indexing, queue tuning, memory leaks |
| `gja-review-security` | Code review for security vulnerabilities | Auth flows, token handling, SQL injection, data leaks |

## Commands

| Command | Description | Agent |
|---|---|---|
| `/cover-tests` | Analyze code for missing test coverage; suggest tests | gja-qa-engineer |
| `/review-changes [dimension]` | Review recent diffs in one dimension: logic / performance / security | gja-review-{logic,performance,security} |

## User-Level Rules (`~/.claude/rules/`)

| Rule | Purpose | Status |
|---|---|---|
| `context7.md` | Use Context7 MCP to fetch current library docs instead of relying on training data (React, Next.js, Prisma, Express, NestJS, etc.) | Active |

## Project-Level Rules (canonical source: `docs/`)

**Note:** Conventions formerly in `.cursor/rules/*.mdc` now live alongside other docs in the `docs/` directory. They are referenced via symlinks from `.cursor/rules/` for Cursor auto-attach.

| File | Globs | Purpose |
|---|---|---|
| `docs/architecture.md` | `src/**/*.ts` | Module structure, DB schema, queue design, WebSocket architecture |
| `docs/conventions.md` | `src/**/*.ts` | Code style, naming, NestJS patterns, testing, debugging |
| `docs/domain-glossary.md` | `src/module/job/**,src/module/job-scoring/**,src/module/candidate-application/**` | Domain terminology, business rules, ETL flows |
| `docs/websocket.md` | `src/**/gateway/**/*.ts` | WebSocket event schemas and subscriptions |
| `docs/api.md` | `src/**/controller/**/*.ts,src/**/dto/**/*.ts` | HTTP endpoint reference |

## Skills

- **Backend**: NestJS 11, TypeORM, PostgreSQL 16, BullMQ, Ollama, Apify, JWT, Socket.io, TypeScript advanced types
- **Frontend**: React 19, TanStack Query 5, React Router 7, TailwindCSS 4, Zod, Radix UI
- **Infrastructure**: Docker Compose, PostgreSQL, Redis 7
- **Testing**: Jest, integration tests
- **Documentation**: Markdown, technical writing

## How Agents Use This Catalog

1. **New agent joining**: Read this file to understand the team structure and which agent to escalate to
2. **Feature implementation**: Invoke `gja-backend-nestjs` or `gja-frontend-react` with detailed requirements; they cross-reference `docs/` for conventions
3. **Code review**: Invoke `/review-changes logic` (or performance/security) to analyze recent commits
4. **Documentation sync**: After a code change, invoke `gja-scribe` to update the canonical docs in `docs/`
5. **Complex decisions**: Escalate to `gja-architect` to plan the approach before implementation starts

## Project Structure Map

**Backend** (`get-job-assistent`)
```
README.md                    # Human-facing setup, dev commands
CLAUDE.md                    # Agent router + minimal conventions (~100 lines)
docs/
  ├── architecture.md        # Module structure, DB schema, queues, WS
  ├── api.md                 # Full HTTP endpoint reference
  ├── websocket.md           # WebSocket events and payloads
  ├── conventions.md         # Code style, naming, testing patterns
  ├── domain-glossary.md     # Domain terminology and business rules
  └── agents-and-rules.md    # This file
lib/sdk/README.md           # SDK installation and exports
```

**Dashboard** (`get-job-assistent-dashboard`)
```
README.md                    # Human-facing setup, features, dev commands
CLAUDE.md                    # Agent router + minimal conventions (~100 lines)
docs/
  ├── architecture.md        # Routes, state management, API client
  ├── conventions.md         # Component patterns, Zod schemas, TanStack Query
  ├── integration-tasks.md   # Frontend checklists for backend features
  └── agents-and-rules.md    # Team catalog (may duplicate backend version)
```

## Token Efficiency Notes

- **CLAUDE.md** (~100 lines) is auto-loaded into every agent context; use it as a router to `docs/`
- **Deep docs** in `docs/` are ~1–2 KB each and fetched only when relevant
- **Agent context**: Agents have access to the full codebase; rely on `docs/` to answer "where do I look?" questions
- **Avoid duplication**: Each fact lives in exactly one file; cross-link aggressively

---

See also: [README.md](../README.md), [CLAUDE.md](../CLAUDE.md)
