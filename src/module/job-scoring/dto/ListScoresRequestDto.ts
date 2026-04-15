import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationDto } from 'src/common/dto/PaginationDto';

export class ListScoresRequestDto extends PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    minScore?: number;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    locationMatch?: boolean;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(['score:desc', 'score:asc', 'publishedAt:desc'])
    sort: 'score:desc' | 'score:asc' | 'publishedAt:desc' = 'score:desc';
}
