import { ContractTypeEnum, ExperienceLevelEnum, PublishedAtEnum, WorkTypeEnum } from 'lib/sdk/job/enum';

export interface ILinkedinJobsQueuePayload {
    runId: string;
    location: string;
    title: string;
    contractType: ContractTypeEnum;
    experienceLevel: ExperienceLevelEnum;
    publishedAt: PublishedAtEnum;
    workType: WorkTypeEnum;
    rows?: number;
}
