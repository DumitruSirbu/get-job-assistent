export interface IJobScoringItemFailedPayload {
    runId: string;
    jobDescriptionId: number;
    error: string;
    completedItems: number;
    failedItems: number;
    totalJobs: number;
}
