import type { IJobScoringCounters } from './IJobScoringCounters';

export interface IJobScoringItemFailedPayload extends IJobScoringCounters {
    runId: string;
    jobDescriptionId: number;
    error: string;
}
