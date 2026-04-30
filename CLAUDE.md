# CLAUDE.md

A NestJS backend that scrapes LinkedIn, extracts candidate profiles from CVs, scores jobs, and tracks applications. See [README.md](./README.md) for setup.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node 22, TypeScript (ES2023, `nodenext`) |
| Framework | NestJS 11 |
| Database | PostgreSQL 16 via TypeORM |
| Queue | BullMQ + Redis 7 |
| LLM | Ollama (local) |
| WebSocket | Socket.io |
| Job scraper | Apify Client |
| Auth | JWT + passport-jwt |

## Dev Commands

```bash
npm run start:dev              # dev with watch
npm run migration:run          # apply pending migrations
npm run migration:generate -- src/module/job/migrations/Name  # auto-generate from entity diff
npm run lint                   # ESLint with --fix
npm run format                 # Prettier
npm run sdk:build && npm run sdk:publish  # build & publish SDK
```

## Module/Folder Layout

Each domain (job, candidate, job-scoring, etc.) is a self-contained NestJS module under `src/module/`. Each module owns its own entities, repositories, services, controllers, and migrations. No cross-module entity sharing.

**Key modules:**
- `job` — job scraping + lookup tables
- `candidate` — candidate profile extraction from CV
- `candidate-application` — job application tracking
- `job-scoring` — job scoring with BullMQ queue + WebSocket gateway
- `auth` — JWT guard, strategies, decorators
- `user` — registration, login, token refresh
- `ollama` — Ollama LLM integration (CV extraction, job scoring prompts)

Folder structure:
```
src/
├── main.ts
├── AppModule.ts
├── config/             # ORM, BullMQ, Ollama config
├── common/             # DTOs, interfaces, utils shared across modules
└── module/
    ├── auth, user, apify, job, candidate, candidate-application, job-scoring, ollama
    └── each module: entity/, repository/, service/, controller/, dto/, migrations/, [gateway/], [queue/]
```

## Where to look for…

- **Architecture details** → [docs/architecture.md](./docs/architecture.md) (modules, DB schema, queues, WebSocket)
- **HTTP API reference** → [docs/api.md](./docs/api.md) (all endpoints, request/response shapes)
- **WebSocket events** → [docs/websocket.md](./docs/websocket.md) (namespaces, subscriptions, payloads)
- **Naming + testing patterns** → [docs/conventions.md](./docs/conventions.md) (entity naming, DTOs, services, debugging)
- **Domain terminology** → [docs/domain-glossary.md](./docs/domain-glossary.md) (ETL flows, candidate processing, scoring algorithm)
- **Agents + rules** → [docs/agents-and-rules.md](./docs/agents-and-rules.md) (subagents, commands, skills)

## Hard Rules

1. **Always use repository pattern** — all data access goes through repositories extending `BaseRepository<T>`
2. **DTOs validated with class-validator** — every endpoint validates `@Body()` and `@Query()` params via DTO
3. **Migrations are mandatory** — never use `synchronize: true`; create a migration for every schema change
4. **Global JWT guard** — `JwtAuthGuard` applied via `APP_GUARD`; mark public routes with `@Public()`
5. **No entity cross-modules** — each module owns its entities; use repositories for cross-module queries
6. **WebSocket events via gateway injection** — services inject gateways and call methods to emit
7. **Duplicate key errors are non-fatal** — catch and log in bulk insert operations (used in scoring)
8. **Entities are snake_case in DB, camelCase in TS** — always specify `@Column({ name: '...' })`
9. **Enums live in `enum/` folder** — not in interfaces; use `ScorerTypeEnum` not inline enums
10. **SDK is the source of truth** — API contracts, enums, types should match `lib/sdk/` exports

## Context7 Reminder

See `~/.claude/rules/context7.md` — use Context7 MCP to fetch library docs for NestJS, TypeORM, BullMQ, Socket.io, etc. instead of relying on training data.
