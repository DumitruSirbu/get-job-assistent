import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOB_SCORING_QUEUE } from '../const';
import type { IJobScoringQueuePayload } from '../interface/IJobScoringQueuePayload';
import { JobScoringService } from '../service/JobScoringService';
import { JobScoringGateway } from '../gateway/JobScoringGateway';

@Processor(JOB_SCORING_QUEUE, {
    // Ollama scoring can take minutes per item on larger models.
    // Keep the lock alive longer to avoid "Missing lock" on completion.
    lockDuration: 10 * 60 * 1000,
    stalledInterval: 30 * 1000,
    maxStalledCount: 1,
    concurrency: 2,
})
export class JobScoringProcessor extends WorkerHost {
    private readonly logger = new Logger(JobScoringProcessor.name);

    constructor(
        private readonly jobScoringService: JobScoringService,
        private readonly jobScoringGateway: JobScoringGateway,
    ) {
        super();
    }

    async process(job: Job<IJobScoringQueuePayload>): Promise<{ score: number }> {
        const { jobDescriptionId, candidateProfileId } = job.data;
        this.logger.log(`Scoring job description ${jobDescriptionId} for candidate ${candidateProfileId} (jobId=${job.id})`);

        const score = await this.jobScoringService.processScoreJobEvent({ jobDescriptionId, candidateProfileId });
        return { score };
    }

    @OnWorkerEvent('completed')
    async onCompleted(job: Job<IJobScoringQueuePayload>, result: { score: number }): Promise<void> {
        const { runId, jobDescriptionId, candidateProfileId } = job.data;
        this.logger.log(`Scored job description ${jobDescriptionId} for candidate ${candidateProfileId} (jobId=${job.id})`);

        if (runId) {
            await this.jobScoringGateway.emitItemCompleted(runId, jobDescriptionId, result?.score ?? 0);
        }
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job<IJobScoringQueuePayload>, error: Error): Promise<void> {
        const { runId, jobDescriptionId, candidateProfileId } = job.data;
        this.logger.error(
            `Failed to score job description ${jobDescriptionId} for candidate ${candidateProfileId} (jobId=${job.id}, attempt=${job.attemptsMade}): ${error.message}`,
        );

        const maxAttempts = job.opts?.attempts ?? 1;
        if (job.attemptsMade < maxAttempts) {
            return;
        }

        if (runId) {
            await this.jobScoringGateway.emitItemFailed(runId, jobDescriptionId, error.message);
        }
    }
}
