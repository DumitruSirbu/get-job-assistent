import { ContractTypeEnum, ExperienceLevelEnum, PublishedAtEnum, WorkTypeEnum } from '../enum';
export declare class GetNewJobsParamsDto {
    title: string;
    contractType: ContractTypeEnum;
    experienceLevel: ExperienceLevelEnum;
    publishedAt: PublishedAtEnum;
    workType: WorkTypeEnum;
    jobRegionIds: number[];
    rows?: number;
}
