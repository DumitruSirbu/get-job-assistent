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
