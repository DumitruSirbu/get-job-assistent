import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { JobDescription } from '../entity/JobDescription';

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
}
