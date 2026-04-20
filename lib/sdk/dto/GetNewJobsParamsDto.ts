import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ContractTypeEnum, ExperienceLevelEnum, PublishedAtEnum, WorkTypeEnum } from '../enum';

export class GetNewJobsParamsDto {
    @IsString()
    title: string;

    @IsEnum(ContractTypeEnum)
    contractType: ContractTypeEnum;

    @IsEnum(ExperienceLevelEnum)
    experienceLevel: ExperienceLevelEnum;

    @IsEnum(PublishedAtEnum)
    publishedAt: PublishedAtEnum;

    @IsEnum(WorkTypeEnum)
    workType: WorkTypeEnum;

    @IsArray()
    @IsInt({ each: true })
    jobRegionIds: number[];

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(1000)
    rows?: number;
}
