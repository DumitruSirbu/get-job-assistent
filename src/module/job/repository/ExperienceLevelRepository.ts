import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExperienceLevel } from '../entity/ExperienceLevel';
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';

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
}
