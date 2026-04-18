import { ContractTypeEnum, ExperienceLevelEnum, LocationEnum, PublishedAtEnum, WorkTypeEnum } from '../enum';
export declare class GetNewJobsParamsDto {
    title: string;
    contractType: ContractTypeEnum;
    experienceLevel: ExperienceLevelEnum;
    publishedAt: PublishedAtEnum;
    workType: WorkTypeEnum;
    locations: LocationEnum[];
    rows?: number;
}
//# sourceMappingURL=GetNewJobsParamsDto.d.ts.map