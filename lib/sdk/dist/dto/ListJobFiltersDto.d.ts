import { PaginationDto } from './PaginationDto';
export declare class ListJobFiltersDto extends PaginationDto {
    search?: string;
    publishedFrom?: string;
    publishedTo?: string;
    companyId?: number[];
    locationId?: number[];
    sectorId?: number[];
    specialityId?: number[];
    experienceLevelId?: number[];
    contractTypeId?: number[];
    applyTypeId?: number[];
    sort: 'publishedAt:desc' | 'publishedAt:asc';
}
//# sourceMappingURL=ListJobFiltersDto.d.ts.map