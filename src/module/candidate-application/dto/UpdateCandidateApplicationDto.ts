import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateCandidateApplicationDto {
    @IsOptional()
    @IsString()
    statusName?: string;

    @IsOptional()
    @IsDateString()
    appliedAt?: string;
}
