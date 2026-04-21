import type { JobScoringRunStatusEnum } from '../enum/JobScoringRunStatusEnum';
import type { IJobScoringCounters } from './IJobScoringCounters';

export interface IJobScoringFinishedPayload extends IJobScoringCounters {
    runId: string;
    status: JobScoringRunStatusEnum;
}
