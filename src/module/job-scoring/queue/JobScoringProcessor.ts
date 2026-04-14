import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOB_SCORING_QUEUE } from '../const';
import type { IJobScoringQueuePayload } from '../interface/IJobScoringQueuePayload';
import { JobScoringService } from '../service/JobScoringService';

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

    constructor(private readonly jobScoringService: JobScoringService) {
        super();
    }

    async process(job: Job<IJobScoringQueuePayload>): Promise<void> {
        const { jobDescriptionId, candidateProfileId } = job.data;
        this.logger.log(`Scoring job description ${jobDescriptionId} for candidate ${candidateProfileId} (jobId=${job.id})`);

        await this.jobScoringService.processScoreJobEvent({ jobDescriptionId, candidateProfileId });
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job<IJobScoringQueuePayload>) {
        this.logger.log(`Scored job description ${job.data.jobDescriptionId} for candidate ${job.data.candidateProfileId} (jobId=${job.id})`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job<IJobScoringQueuePayload>, error: Error) {
        this.logger.error(
            `Failed to score job description ${job.data.jobDescriptionId} for candidate ${job.data.candidateProfileId} (jobId=${job.id}, attempt=${job.attemptsMade}): ${error.message}`,
        );
    }
}
