import type { JobScoringRunStatusEnum } from '../enum/JobScoringRunStatusEnum';

export interface IJobScoringSnapshotPayload {
    runId: string;
    status: JobScoringRunStatusEnum;
    totalJobs: number;
    completedItems: number;
    failedItems: number;
    startedAt: string;
    finishedAt?: string;
}
