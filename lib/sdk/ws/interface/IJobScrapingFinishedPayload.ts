import type { JobScrapingRunStatusEnum } from '../enum/JobScrapingRunStatusEnum';

export interface IJobScrapingFinishedPayload {
    runId: string;
    status: JobScrapingRunStatusEnum;
    totalFoundJobs: number;
    successfulLocations: number;
    failedLocations: number;
    totalLocations: number;
}
