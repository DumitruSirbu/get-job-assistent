import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobDescriptionService } from '../service/JobDescriptionService';
import { JobScrapingGateway } from '../gateway/JobScrapingGateway';
import type { ILinkedinJobsQueuePayload } from '../interface/ILinkedinJobsQueuePayload';
import { LINKEDIN_JOBS_QUEUE } from '../const';

@Processor(LINKEDIN_JOBS_QUEUE)
export class LinkedinJobsProcessor extends WorkerHost {
    private readonly logger = new Logger(LinkedinJobsProcessor.name);

    constructor(
        private readonly jobDescriptionService: JobDescriptionService,
        private readonly jobScrapingGateway: JobScrapingGateway,
    ) {
        super();
    }

    async process(job: Job<ILinkedinJobsQueuePayload>): Promise<{ foundJobs: number }> {
        const { location, runId, ...params } = job.data;
        this.logger.log(`Processing location: ${location} (jobId=${job.id}, runId=${runId})`);

        const foundJobs = await this.jobDescriptionService.processJobsByLocation(location, params);
        return { foundJobs };
    }

    @OnWorkerEvent('completed')
    async onCompleted(job: Job<ILinkedinJobsQueuePayload>, result: { foundJobs: number }): Promise<void> {
        const { runId, location } = job.data;
        const foundJobs = result?.foundJobs ?? 0;
        this.logger.log(`Completed location: ${location} (jobId=${job.id}, runId=${runId}, found=${foundJobs})`);
        await this.jobScrapingGateway.emitLocationCompleted({ runId, location, foundJobs });
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job<ILinkedinJobsQueuePayload>, error: Error): Promise<void> {
        const { runId, location } = job.data;
        this.logger.error(`Failed location: ${location} (jobId=${job.id}, runId=${runId}, attempt=${job.attemptsMade}): ${error.message}`);

        const maxAttempts = job.opts?.attempts ?? 1;
        if (job.attemptsMade < maxAttempts) {
            return;
        }

        await this.jobScrapingGateway.emitLocationFailed({ runId, location, error: error.message });
    }
}
