import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/PaginationDto';
import { toArray } from 'src/common/utils/toArray';

export class ListJobFiltersDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    publishedFrom?: string;

    @IsOptional()
    @IsString()
    publishedTo?: string;

    @IsOptional()
    @Transform(toArray)
    @Type(() => Number)
    @IsInt({ each: true })
    companyId?: number[];

    @IsOptional()
    @Transform(toArray)
    @Type(() => Number)
    @IsInt({ each: true })
    locationId?: number[];

    @IsOptional()
    @Transform(toArray)
    @Type(() => Number)
    @IsInt({ each: true })
    sectorId?: number[];

    @IsOptional()
    @Transform(toArray)
    @Type(() => Number)
    @IsInt({ each: true })
    specialityId?: number[];

    @IsOptional()
    @Transform(toArray)
    @Type(() => Number)
    @IsInt({ each: true })
    experienceLevelId?: number[];

    @IsOptional()
    @Transform(toArray)
    @Type(() => Number)
    @IsInt({ each: true })
    contractTypeId?: number[];

    @IsOptional()
    @Transform(toArray)
    @Type(() => Number)
    @IsInt({ each: true })
    applyTypeId?: number[];

    @IsOptional()
    @IsIn(['publishedAt:desc', 'publishedAt:asc'])
    sort: 'publishedAt:desc' | 'publishedAt:asc' = 'publishedAt:desc';
}
