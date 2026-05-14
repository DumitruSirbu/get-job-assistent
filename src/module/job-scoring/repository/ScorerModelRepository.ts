import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { ScorerModel } from '../entity/ScorerModel';
import { IScorerModel } from '../interface/IScorerModel';

@Injectable()
export class ScorerModelRepository extends BaseRepository<ScorerModel> {
    constructor(
        @InjectRepository(ScorerModel)
        private readonly scorerModelRepository: Repository<ScorerModel>,
    ) {
        super(scorerModelRepository);
    }

    async findById(scorerModelId: number): Promise<ScorerModel | null> {
        return this.scorerModelRepository.findOne({ where: { scorerModelId } });
    }

    async findByProviderAndModel(scorerProvider: string, scorerModel: string): Promise<ScorerModel | null> {
        return this.scorerModelRepository.findOne({ where: { scorerProvider, scorerModel } });
    }

    async findOrCreate(item: IScorerModel): Promise<ScorerModel> {
        const existing = await this.findByProviderAndModel(item.scorerProvider, item.scorerModel);
        if (existing) {
            return existing;
        }
        const entity = this.scorerModelRepository.create(item);
        try {
            return await this.scorerModelRepository.save(entity);
        } catch (error: unknown) {
            const isDuplicate = error instanceof Error && (error.message.includes('duplicate key') || error.message.includes('unique constraint'));
            if (!isDuplicate) {
                throw error;
            }
            const raced = await this.findByProviderAndModel(item.scorerProvider, item.scorerModel);
            if (!raced) {
                throw error;
            }
            return raced;
        }
    }
}
