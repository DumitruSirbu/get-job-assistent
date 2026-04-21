import type { JobScoringRunStatusEnum } from '../enum/JobScoringRunStatusEnum';
import type { IJobScoringCounters } from './IJobScoringCounters';
import type { IJobScoringItemState } from './IJobScoringItemState';

export interface IJobScoringSnapshotPayload extends IJobScoringCounters {
    runId: string;
    status: JobScoringRunStatusEnum;
    startedAt: string;
    finishedAt?: string;
    items: IJobScoringItemState[];
}
