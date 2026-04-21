import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { IScoreNewestJobsParams } from '../../../../lib/sdk/job-scoring/interface';

export class ScoreNewestJobsRequestDto implements IScoreNewestJobsParams {
    @IsOptional()
    @IsString()
    titleKeyword?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    limit?: number;
}
