import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { JobDescription } from '../entity/JobDescription';
import { IJobDescription } from '../interface/IJobDescription';

@Injectable()
export class JobDescriptionRepository extends BaseRepository<JobDescription> {
    constructor(
        @InjectRepository(JobDescription)
        private readonly jobDescriptionRepository: Repository<JobDescription>,
    ) {
        super(jobDescriptionRepository);
    }

    async findById(jobDescriptionId: number): Promise<JobDescription | null> {
        return this.jobDescriptionRepository.findOne({ where: { jobDescriptionId } });
    }

    async findUnscoredByCandidateAndScorer(candidateProfileId: number, scorerModelId: number, version: string): Promise<JobDescription[]> {
        return this.jobDescriptionRepository
            .createQueryBuilder('jobDescription')
            .where(
                `NOT EXISTS (
                    SELECT 1
                    FROM job_match_score jobMatchScore
                    WHERE jobMatchScore.job_description_id = "jobDescription".job_description_id
                      AND jobMatchScore.candidate_profile_id = :candidateProfileId
                      AND jobMatchScore.scorer_model_id = :scorerModelId
                      AND jobMatchScore.version = :version
                )`,
                {
                    candidateProfileId,
                    scorerModelId,
                    version,
                },
            )
            .getMany();
    }

    async insertNewJobDescriptions(items: IJobDescription[]): Promise<void> {
        if (!items.length) {
            return;
        }

        const deduped = new Map<number, IJobDescription>();
        for (const item of items) {
            const jobExternalId = item.jobExternalId;
            if (!jobExternalId || deduped.has(jobExternalId)) {
                continue;
            }

            deduped.set(jobExternalId, item);
        }

        const valuesToInsert = Array.from(deduped.values());

        await this.insertManyIgnoreConflicts(valuesToInsert);
    }
}
