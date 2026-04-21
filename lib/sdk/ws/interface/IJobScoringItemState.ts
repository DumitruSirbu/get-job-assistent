import type { JobScrapingLocationStatusEnum } from '../enum/JobScrapingLocationStatusEnum';

export interface IJobScoringItemState {
    jobDescriptionId: number;
    status: JobScrapingLocationStatusEnum.COMPLETED | JobScrapingLocationStatusEnum.FAILED;
    score?: number;
    error?: string;
}
