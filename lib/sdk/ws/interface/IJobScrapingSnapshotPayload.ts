import type { JobScrapingRunStatusEnum } from '../enum/JobScrapingRunStatusEnum';
import type { IJobScrapingLocationState } from './IJobScrapingLocationState';

export interface IJobScrapingSnapshotPayload {
    runId: string;
    status: JobScrapingRunStatusEnum;
    locations: string[];
    locationStates?: Record<string, IJobScrapingLocationState>;
    totalLocations: number;
    completedLocations: number;
    failedLocations: number;
    totalFoundJobs: number;
    startedAt: string;
    finishedAt?: string;
}
