import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobDescriptionService } from '../service/JobDescriptionService';
import type { ILinkedinJobsQueuePayload } from '../interface/ILinkedinJobsQueuePayload';
import { LINKEDIN_JOBS_QUEUE } from '../const';

@Processor(LINKEDIN_JOBS_QUEUE)
export class LinkedinJobsProcessor extends WorkerHost {
    private readonly logger = new Logger(LinkedinJobsProcessor.name);

    constructor(private readonly jobDescriptionService: JobDescriptionService) {
        super();
    }

    async process(job: Job<ILinkedinJobsQueuePayload>): Promise<void> {
        const { location, ...params } = job.data;
        this.logger.log(`Processing location: ${location} (jobId=${job.id})`);

        await this.jobDescriptionService.processJobsByLocation(location, params);
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job<ILinkedinJobsQueuePayload>) {
        this.logger.log(`Completed location: ${job.data.location} (jobId=${job.id})`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job<ILinkedinJobsQueuePayload>, error: Error) {
        this.logger.error(`Failed location: ${job.data.location} (jobId=${job.id}, attempt=${job.attemptsMade}): ${error.message}`);
    }
}
