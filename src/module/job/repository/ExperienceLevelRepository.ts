import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExperienceLevel } from '../entity/ExperienceLevel';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { IExperienceLevel } from '../interface';
import { normalizeStringValue } from 'src/common/utils/normalizeStringValue';

@Injectable()
export class ExperienceLevelRepository extends BaseRepository<ExperienceLevel> {
    constructor(
        @InjectRepository(ExperienceLevel)
        private readonly experienceLevelRepository: Repository<ExperienceLevel>,
    ) {
        super(experienceLevelRepository);
    }

    async findById(experienceLevelId: number): Promise<ExperienceLevel | null> {
        return this.experienceLevelRepository.findOne({ where: { experienceLevelId } });
    }

    async findAllAndMap(): Promise<Map<string, number>> {
        const experienceLevels = await this.findAll();
        return new Map(experienceLevels.map((experienceLevel) => [experienceLevel.experienceLevelName, experienceLevel.experienceLevelId]));
    }

    async insertNewExperienceLevels(items: IExperienceLevel[]): Promise<void> {
        if (!items.length) {
            return;
        }

        const valuesToInsert = items.map((item) => ({ experienceLevelName: normalizeStringValue(item.experienceLevelName) }));

        await this.insertManyIgnoreConflicts(valuesToInsert);
    }
}
