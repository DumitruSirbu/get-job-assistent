import type { JobScoringRunStatusEnum } from '../enum/JobScoringRunStatusEnum';

export interface IJobScoringFinishedPayload {
    runId: string;
    status: JobScoringRunStatusEnum;
    completedItems: number;
    failedItems: number;
    totalJobs: number;
}
