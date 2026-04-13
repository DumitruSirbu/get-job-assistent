import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
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

    async findAllAndMap(): Promise<Map<string, number>> {
        const scorerModels = await this.findAll();
        return new Map(scorerModels.map((item) => [`${item.scorerProvider}:${item.scorerModel}`, item.scorerModelId]));
    }

    async insertNewScorerModels(items: IScorerModel[]): Promise<void> {
        if (!items.length) {
            return;
        }

        await this.insertManyIgnoreConflicts(items);
    }
}
