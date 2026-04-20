export interface IJobScrapingLocationCompletedPayload {
    runId: string;
    location: string;
    foundJobs: number;
    completedLocations: number;
    totalLocations: number;
}
