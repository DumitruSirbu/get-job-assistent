import { ObjectLiteral, Repository } from 'typeorm';

export abstract class BaseRepository<TEntity extends ObjectLiteral> {
    protected constructor(protected readonly repository: Repository<TEntity>) {}

    async findAll(): Promise<TEntity[]> {
        return this.repository.find();
    }

    async create(entity: TEntity): Promise<TEntity> {
        return this.repository.save(entity);
    }
}
