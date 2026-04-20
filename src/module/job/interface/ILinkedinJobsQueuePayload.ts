import { ContractTypeEnum, ExperienceLevelEnum, PublishedAtEnum, WorkTypeEnum } from 'lib/sdk/enum';

export interface ILinkedinJobsQueuePayload {
    location: string;
    title?: string;
    contractType?: ContractTypeEnum;
    experienceLevel?: ExperienceLevelEnum;
    publishedAt?: PublishedAtEnum;
    workType?: WorkTypeEnum;
    rows?: number;
}
