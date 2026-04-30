---
description: Code style, naming conventions, entity/DTO/repository patterns, and testing guidelines
globs: "src/**/*.ts"
alwaysApply: false
---

# Conventions

## Formatting (Prettier)

- **Indent:** 4 spaces for `.ts`, `.js`, `.tsx`, `.json` files
- **Quotes:** single quotes for TS/JS/JSON
- **Print width:** 160 characters
- **Trailing commas:** always (`trailingComma: 'all'`)
- **Semicolons:** always
- **Arrow parens:** always (`(x) => ...`, not `x => ...`)

## TypeScript Config

- **Target:** ES2023, module: `nodenext`
- **Strict modes enabled:** `strictNullChecks`, `noImplicitAny`, `strictBindCallApply`
- **Decorators:** `experimentalDecorators` + `emitDecoratorMetadata` (required for NestJS DI)

## ESLint Rules

- `@typescript-eslint/no-explicit-any`: **off** (any is allowed)
- `@typescript-eslint/no-floating-promises`: **warn**
- `@typescript-eslint/no-unsafe-argument`: **warn**
- `import/no-extraneous-dependencies`: **error**
- Prettier integration enforced via `eslint-plugin-prettier`

## Naming Conventions

| Kind | Convention | Example |
|---|---|---|
| Files — classes | PascalCase | `JobDescriptionService.ts` |
| Files — interfaces | `I` prefix + PascalCase | `IJobDescription.ts` |
| Files — enums | PascalCase + `Enum` suffix | `ScorerTypeEnum.ts` |
| Files — constants | camelCase | `linkedinJobsConsts.ts` |
| Files — utils | camelCase | `normalizeStringValue.ts` |
| Classes | PascalCase | `JobDescriptionService` |
| Interfaces | `I` prefix | `IJobDescription`, `ICompany` |
| Enum declarations | PascalCase + `Enum` suffix | `ScorerTypeEnum` |
| Constants | UPPER_SNAKE_CASE | `LINKEDIN_JOBS_QUEUE` |
| Entity properties | camelCase | `jobExternalId` |
| DB columns | snake_case | `job_external_id` |

## Entity Rules

- Always set `@Entity({ name: 'snake_case_table', synchronize: false })` — schema is migration-driven
- PK: `@PrimaryGeneratedColumn({ name: '<table>_id' })` → auto-increment integer
- Column names: `snake_case` in DB, `camelCase` in TypeScript; always specify `name` explicitly
- Always specify `type` in `@Column` (`'varchar'`, `'text'`, `'integer'`, `'bigint'`, `'date'`, `'timestamp'`, `'boolean'`, `'jsonb'`)
- Nullable columns: `{ nullable: true }` in decorator + TypeScript `?: string | null`
- JSON data: use PostgreSQL `jsonb` type, typed as `object | null` in TypeScript
- No TypeScript enums on entity columns; dimension values are separate lookup tables
- Timestamps: `created_at` / `updated_at` with `default: () => 'CURRENT_TIMESTAMP'` + `@BeforeInsert` / `@BeforeUpdate` hooks

### Entity Relations

- Use `@ManyToOne(() => RelatedEntity)` + `@JoinColumn({ name: 'fk_column', referencedColumnName: 'pkProperty' })`
- Always define BOTH the FK `@Column` (for direct id access) AND the `@ManyToOne` relation on the same DB column
- `referencedColumnName` uses the TypeScript property name, not the DB column name

### Entity Barrel

Every entity must be re-exported from its module's `entity/index.ts` and registered in the owning module's `TypeOrmModule.forFeature([...])`. Entities are **not** cross-registered — each module owns its own entities.

## DTO/Interface Naming

- Request DTOs: `<Action>RequestDto` or `<Entity><Action>Dto` (e.g., `ListScoresRequestDto`, `ScoreNewestJobsRequestDto`)
- Response interfaces: `I<Entity>Response` or `I<Entity>Row` (e.g., `IJobScoreRow`)

## Repository Pattern

- One repository per entity; extends `BaseRepository<T>` (abstract, in `src/common/repository/BaseRepository.ts`)
- Injected via `@InjectRepository(Entity)` + passed to `super(repository)` in constructor
- Inherited methods: `findAll()`, `create()`, `insertManyIgnoreConflicts()` (protected)
- Domain-specific queries as public methods (e.g., `findWithFilters()`, `findLatest()`)
- Pattern for lookup repos: `findAllAndMap()` returns `Map<normalizedName, id>` for ETL FK resolution
- Pattern for bulk insert: deduplicate in-memory first, then call `insertManyIgnoreConflicts`
- No repository barrel file — import each repo by direct path

## Service Layer

- `*Service` — handles business logic, calls repositories and external services (Ollama, Apify)
- `*Gateway` — WebSocket handlers; emit events to clients
- Keep gateway logic light; complex state updates happen in services via gateway injection
- Use NestJS `Logger` (not `console.log`): `private readonly logger = new Logger(MyService.name)`
- `Promise.all` for parallel independent I/O
- Errors: log + rethrow in integration services, propagation in domain services

## NestJS Patterns

### Dependency Injection

```typescript
@Injectable()
export class MyService {
    constructor(
        private readonly someRepository: SomeRepository,
        private readonly otherService: OtherService,
        @InjectQueue(QUEUE_NAME) private readonly queue: Queue,
    ) {}
}
```

- Always use `private readonly` for injected dependencies
- Custom injection tokens: `@Inject('TOKEN_NAME')` for factory providers
- BullMQ: `@InjectQueue(QUEUE_NAME)` with queue name from const

### Module Registration

```typescript
@Module({
    imports: [
        TypeOrmModule.forFeature([Entity1, Entity2, ...]),
        BullModule.registerQueue({ name: QUEUE_NAME }),
        OtherModule,
    ],
    controllers: [MyController],
    providers: [MyService, MyRepository, MyProcessor],
})
export class MyModule {}
```

### Controllers

- Routes: `@Controller('resource-name')` with kebab-case paths
- Methods: use standard HTTP verbs (`@Get`, `@Post`, `@Patch`, `@Delete`)
- DTOs for all validated inputs — both `@Body()` and `@Query()`; always use `class-validator` decorators
- Extend `PaginationDto` for paginated query params
- `@Post` endpoints that return data (not 201) should use `@HttpCode(HttpStatus.OK)`
- `@Delete` endpoints returning nothing should use `@HttpCode(HttpStatus.NO_CONTENT)`

Example with body:
```typescript
@Post('process-cv')
async processCV(@Body() body: ProcessCvDto): Promise<CandidateProfile> {
    return this.service.processCV(body.version);
}
```

### Authentication

- Global `JwtAuthGuard` is applied via `APP_GUARD` in `AppModule` — do NOT add `@UseGuards` on individual controllers
- Mark public routes with `@Public()` (imported from `src/module/auth/decorator/Public`):

```typescript
@Public()
@Post('login')
@HttpCode(HttpStatus.OK)
async login(@Body() body: LoginDto): Promise<ITokenResponse> { ... }
```

### Queue Processors

```typescript
@Processor(QUEUE_NAME, {
    lockDuration: 10 * 60 * 1000,  // 10 minutes for long-running jobs
    stalledInterval: 30 * 1000,
    maxStalledCount: 1,
    concurrency: 2,
})
export class MyProcessor extends WorkerHost {
    private readonly logger = new Logger(MyProcessor.name);
    constructor(private readonly service: MyService) { super(); }
    async process(job: Job<PayloadType>): Promise<void> { ... }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) { this.logger.log(`Done: ${job.id}`); }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) { this.logger.error(`Failed: ${job.id}`, error.message); }
}
```

## Barrel Exports

Each subfolder (`entity/`, `interface/`, `const/`, `utils/`, `controller/`, `service/`, `enum/`) has an `index.ts` that re-exports all public members. Keep it updated when adding new files. **Exceptions:** `repository/` and `dto/` have no barrel — import each directly.

### Enum Placement

- Place enums in the module `enum/` folder, not in `interface/` files
- Enum file names must use `Enum` suffix (e.g. `ScorerTypeEnum.ts`)
- Enum type names must use `Enum` suffix (e.g. `ScorerTypeEnum`)

## Error Handling

- **Apify integration**: `try/catch` → log with context → rethrow original error
- **Domain services**: let errors propagate naturally
- **Duplicate key on insert**: catch, inspect `error.message` for `'duplicate key'` or `'unique constraint'`, log warn and return (no rethrow) — used in `JobScoringService`
- No global exception filter currently — errors reach NestJS default handler

## Migration Rules

- **File naming:** `YYYYMMDDHHMMSS-<DescriptiveName>.ts` (e.g., `20260409090800-CreateJobDescriptionTable.ts`)
- **Class naming:** `<DescriptiveName><Timestamp> implements MigrationInterface`
- **Table creation:** `new Table({ name, columns })` + `queryRunner.createTable(table, true)`
- **Foreign keys:** `new TableForeignKey({ name: 'FK_<table>_<column>', ... })` + `queryRunner.createForeignKeys`
- **Indexes:** `new TableIndex({ name: 'IDX_<table>_<column>[_unique]', ... })` + `queryRunner.createIndices`
- **`down()` must reverse in exact opposite order:** drop indexes (reverse) → drop FKs (reverse) → drop table
- **onDelete policy:** RESTRICT for required lookups, SET NULL for optional FKs, CASCADE for dependent child rows
- **onUpdate:** always CASCADE
- **Migrations transaction mode:** `each` (each migration in its own transaction)

## Testing Patterns

- Unit tests use `jest` with mocks for repositories/services
- Integration tests run against a test database
- Use factory functions to seed test data
- Test file location mirrors source (e.g., `src/module/job/service/JobDescriptionService.ts` → `src/module/job/service/__tests__/JobDescriptionService.spec.ts`)

## Common Tasks

### Add a New API Endpoint

1. Create a method in the entity's `service/`
2. Add a route method in `controller/`
3. If needed, create a DTO in `dto/` and add validation decorators
4. Update `docs/api.md` with the new endpoint

### Add a New Database Column

1. Update the entity in `entity/`
2. Create a migration in `migrations/` using `npm run migration:generate`
3. Run `npm run migration:run`

### Update SDK Exports

1. Add/update interfaces or enums in `lib/sdk/`
2. Update barrel exports in `lib/sdk/job-scoring/interface/index.ts` or `lib/sdk/job-scoring/enum/index.ts`
3. Run `npm run sdk:build && npm run sdk:publish` to publish

### Add WebSocket Events

1. Define event constants + interfaces in `lib/sdk/ws/`
2. Create a `*Gateway` in `src/module/*/gateway/`
3. Inject gateway into service; call gateway methods to emit
4. Update `docs/websocket.md` with new events
5. Update dashboard to listen for new events

## Debugging

### Enable TypeORM Query Logging

```bash
NODE_ENV=development npm run start:dev
# Queries will log to console
```

### Check BullMQ Queue Status

```bash
redis-cli
> HGETALL bull:job-scoring:data   # view job data
> LLEN bull:job-scoring:active     # active job count
```

### Inspect Ollama Response

Add logging in `OllamaJobScoringService.score()`:
```typescript
console.log('Ollama response:', JSON.stringify(response, null, 2));
```

### Test a Single Scoring Run

```bash
curl -X POST http://localhost:3000/job-scoring/score-newest-jobs/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"limit": 5}'
```

Then check WebSocket progress or poll `GET /job-scoring/scoring-run/<runId>/snapshot`.

## See also

- [docs/architecture.md](./architecture.md) — module structure and design patterns
- [docs/domain-glossary.md](./domain-glossary.md) — domain terminology and business rules
- [README.md](../README.md) — setup and dev commands
