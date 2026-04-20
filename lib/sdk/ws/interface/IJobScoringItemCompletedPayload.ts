export interface IJobScoringItemCompletedPayload {
    runId: string;
    jobDescriptionId: number;
    score: number;
    completedItems: number;
    totalJobs: number;
}
