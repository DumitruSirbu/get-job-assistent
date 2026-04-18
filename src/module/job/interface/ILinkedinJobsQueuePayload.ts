import { ContractTypeEnum, ExperienceLevelEnum, LocationEnum, PublishedAtEnum, WorkTypeEnum } from 'lib/sdk/enum';

export interface ILinkedinJobsQueuePayload {
    location: LocationEnum;
    title?: string;
    contractType?: ContractTypeEnum;
    experienceLevel?: ExperienceLevelEnum;
    publishedAt?: PublishedAtEnum;
    workType?: WorkTypeEnum;
    rows?: number;
}
