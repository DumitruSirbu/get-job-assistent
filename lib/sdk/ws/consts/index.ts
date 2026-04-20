export const JOB_SCRAPING_NAMESPACE = '/job-scraping';

export const JobScrapingClientEvent = {
    SUBSCRIBE: 'job-scraping:subscribe',
} as const;

export const JobScrapingServerEvent = {
    STARTED: 'job-scraping:started',
    LOCATION_COMPLETED: 'job-scraping:location-completed',
    LOCATION_FAILED: 'job-scraping:location-failed',
    FINISHED: 'job-scraping:finished',
    SNAPSHOT: 'job-scraping:snapshot',
} as const;

export const JOB_SCORING_NAMESPACE = '/job-scoring';

export const JobScoringClientEvent = {
    SUBSCRIBE: 'job-scoring:subscribe',
} as const;

export const JobScoringServerEvent = {
    STARTED: 'job-scoring:started',
    ITEM_COMPLETED: 'job-scoring:item-completed',
    ITEM_FAILED: 'job-scoring:item-failed',
    FINISHED: 'job-scoring:finished',
    SNAPSHOT: 'job-scoring:snapshot',
} as const;
