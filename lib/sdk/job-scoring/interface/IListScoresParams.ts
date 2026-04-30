import { JobScoreVisibilityEnum } from '../enum/JobScoreVisibilityEnum';

export interface IListScoresParams {
    minScore?: number;
    locationMatch?: boolean;
    search?: string;
    sort?: 'score:desc' | 'score:asc' | 'publishedAt:desc';
    scoredFrom?: string;
    scoredTo?: string;
    applicationStatusId?: number[];
    noApplication?: boolean;
    companyId?: number[];
    /**
     * Controls which score rows are returned based on their hidden flag.
     * - 'visible'  (default) — only rows where hidden = false
     * - 'hidden'             — only rows where hidden = true
     * - 'all'                — all rows regardless of hidden flag
     */
    visibility?: JobScoreVisibilityEnum;
}
