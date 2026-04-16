import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCandidateApplicationDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    jobDescriptionId: number;

    @IsOptional()
    @IsString()
    statusName?: string;

    @IsOptional()
    @IsDateString()
    appliedAt?: string;
}
