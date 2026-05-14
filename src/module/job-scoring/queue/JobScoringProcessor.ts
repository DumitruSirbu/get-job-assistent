import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { scoringConfig } from 'src/config/scoringConfig';
import { JOB_SCORING_QUEUE } from '../const';
import { ScorerProviderEnum } from '../enum';
import type { IJobScoringQueuePayload } from '../interface/IJobScoringQueuePayload';
import { JobScoringService } from '../service/JobScoringService';
import { JobScoringGateway } from '../gateway/JobScoringGateway';

// Anthropic enforces strict RPM/TPM limits; cap throughput so large batches
// don't trip 429s. Ollama is local and effectively unlimited, but the same
// cap keeps the worker pool predictable.
const SCORING_RATE_LIMITS: Record<string, { max: number; duration: number }> = {
    [ScorerProviderEnum.ANTHROPIC]: { max: 30, duration: 60 * 1000 },
    [ScorerProviderEnum.OLLAMA]: { max: 120, duration: 60 * 1000 },
};

const limiter = SCORING_RATE_LIMITS[scoringConfig.provider] ?? SCORING_RATE_LIMITS[ScorerProviderEnum.OLLAMA];

@Processor(JOB_SCORING_QUEUE, {
    // Ollama scoring can take minutes per item on larger models.
    // Keep the lock alive longer to avoid "Missing lock" on completion.
    lockDuration: 10 * 60 * 1000,
    stalledInterval: 30 * 1000,
    maxStalledCount: 1,
    concurrency: 2,
    limiter,
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
        const { jobDescriptionId, candidateProfileId, scorerModelId } = job.data;
        this.logger.log(`Scoring job description ${jobDescriptionId} for candidate ${candidateProfileId} (jobId=${job.id})`);

        const score = await this.jobScoringService.processScoreJobEvent({ jobDescriptionId, candidateProfileId, scorerModelId });
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
