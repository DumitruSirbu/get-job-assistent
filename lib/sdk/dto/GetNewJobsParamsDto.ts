import { IsArray, IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';
import { ContractTypeEnum, ExperienceLevelEnum, LocationEnum, PublishedAtEnum, WorkTypeEnum } from '../enum';

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
    @IsEnum(LocationEnum, { each: true })
    locations: LocationEnum[];

    @IsNumber()
    @Min(1)
    @Max(1000)
    rows?: number;
}
