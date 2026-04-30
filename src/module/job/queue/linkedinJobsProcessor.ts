import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobDescriptionService } from '../service/JobDescriptionService';
import { JobScrapingGateway } from '../gateway/JobScrapingGateway';
import type { ILinkedinJobsQueuePayload } from '../interface/ILinkedinJobsQueuePayload';
import { LINKEDIN_JOBS_QUEUE } from '../const';

@Processor(LINKEDIN_JOBS_QUEUE, {
    // Apify scraping + ETL per location can take minutes. Keep the lock alive
    // long enough to avoid "Missing lock" on completion of slow locations.
    lockDuration: 10 * 60 * 1000,
    // Match BullMQ's lock-refresh cadence (lockDuration / 2) so transient Redis
    // hiccups don't get classified as stalls and re-invoke the paid Apify actor.
    stalledInterval: 5 * 60 * 1000,
    // Fail stalled jobs immediately instead of re-running them: each retry
    // re-invokes the Apify actor (real $ cost). Genuine errors still retry via
    // `attempts` configured at dispatch time.
    maxStalledCount: 0,
    concurrency: 2,
})
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
        const attempt = job.attemptsMade + 1;
        const startedAt = Date.now();
        this.logger.log(`Processing location: ${location} (jobId=${job.id}, runId=${runId}, attempt=${attempt})`);

        try {
            const foundJobs = await this.jobDescriptionService.processJobsByLocation(location, params);
            const elapsedMs = Date.now() - startedAt;
            this.logger.log(
                `Finished location: ${location} (jobId=${job.id}, runId=${runId}, attempt=${attempt}, foundJobs=${foundJobs}, elapsedMs=${elapsedMs})`,
            );
            return { foundJobs };
        } catch (error) {
            const elapsedMs = Date.now() - startedAt;
            this.logger.error(
                `Errored location: ${location} (jobId=${job.id}, runId=${runId}, attempt=${attempt}, elapsedMs=${elapsedMs}): ${(error as Error).message}`,
            );
            throw error;
        }
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
        const elapsedMs = job.processedOn ? Date.now() - job.processedOn : null;
        this.logger.error(
            `Failed location: ${location} (jobId=${job.id}, runId=${runId}, attempt=${job.attemptsMade}, elapsedMs=${elapsedMs ?? 'n/a'}): ${error.message}`,
        );

        const maxAttempts = job.opts?.attempts ?? 1;
        if (job.attemptsMade < maxAttempts) {
            return;
        }

        await this.jobScrapingGateway.emitLocationFailed({ runId, location, error: error.message });
    }
}
