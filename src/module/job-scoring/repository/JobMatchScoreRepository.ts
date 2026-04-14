import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/module/job/repository/BaseRepository';
import { JobMatchScore } from '../entity/JobMatchScore';
import { IJobMatchScore } from '../interface/IJobMatchScore';

@Injectable()
export class JobMatchScoreRepository extends BaseRepository<JobMatchScore> {
    constructor(
        @InjectRepository(JobMatchScore)
        private readonly jobMatchScoreRepository: Repository<JobMatchScore>,
    ) {
        super(jobMatchScoreRepository);
    }

    async findById(jobMatchScoreId: number): Promise<JobMatchScore | null> {
        return this.jobMatchScoreRepository.findOne({ where: { jobMatchScoreId } });
    }

    async findByJobDescriptionId(jobDescriptionId: number): Promise<JobMatchScore[]> {
        return this.jobMatchScoreRepository.find({ where: { jobDescriptionId } });
    }

    async insertNewScores(items: IJobMatchScore[]): Promise<void> {
        if (!items.length) {
            return;
        }

        await this.insertManyIgnoreConflicts(items);
    }
}
