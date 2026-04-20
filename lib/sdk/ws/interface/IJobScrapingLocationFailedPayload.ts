export interface IJobScrapingLocationFailedPayload {
    runId: string;
    location: string;
    error: string;
    completedLocations: number;
    totalLocations: number;
}
