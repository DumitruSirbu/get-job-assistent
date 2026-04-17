import { ObjectLiteral, QueryDeepPartialEntity, Repository } from 'typeorm';

export abstract class BaseRepository<TEntity extends ObjectLiteral> {
    protected constructor(protected readonly repository: Repository<TEntity>) {}

    async findAll(): Promise<TEntity[]> {
        return this.repository.find();
    }

    async create(entity: TEntity): Promise<TEntity> {
        return this.repository.save(entity);
    }

    protected async insertManyIgnoreConflicts(valuesToInsert: QueryDeepPartialEntity<TEntity>[]): Promise<void> {
        if (!valuesToInsert.length) {
            return;
        }

        await this.repository
            .createQueryBuilder()
            .insert()
            .into(this.repository.target)
            .values(valuesToInsert)
            .orIgnore() // Postgres: ON CONFLICT DO NOTHING
            .execute();
    }
}
