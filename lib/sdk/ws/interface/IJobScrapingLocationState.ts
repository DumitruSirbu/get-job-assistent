import type { JobScrapingLocationStatusEnum } from '../enum/JobScrapingLocationStatusEnum';

export interface IJobScrapingLocationState {
    status: JobScrapingLocationStatusEnum;
    foundJobs?: number;
    error?: string;
}
