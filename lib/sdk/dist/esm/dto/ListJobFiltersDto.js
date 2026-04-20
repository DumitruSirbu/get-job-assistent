var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './PaginationDto';
import { toArray } from '../utils/toArray';
export class ListJobFiltersDto extends PaginationDto {
    search;
    publishedFrom;
    publishedTo;
    companyId;
    locationId;
    sectorId;
    specialityId;
    experienceLevelId;
    contractTypeId;
    applyTypeId;
    sort = 'publishedAt:desc';
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ListJobFiltersDto.prototype, "search", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ListJobFiltersDto.prototype, "publishedFrom", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ListJobFiltersDto.prototype, "publishedTo", void 0);
__decorate([
    IsOptional(),
    Transform(toArray),
    Type(() => Number),
    IsInt({ each: true }),
    __metadata("design:type", Array)
], ListJobFiltersDto.prototype, "companyId", void 0);
__decorate([
    IsOptional(),
    Transform(toArray),
    Type(() => Number),
    IsInt({ each: true }),
    __metadata("design:type", Array)
], ListJobFiltersDto.prototype, "locationId", void 0);
__decorate([
    IsOptional(),
    Transform(toArray),
    Type(() => Number),
    IsInt({ each: true }),
    __metadata("design:type", Array)
], ListJobFiltersDto.prototype, "sectorId", void 0);
__decorate([
    IsOptional(),
    Transform(toArray),
    Type(() => Number),
    IsInt({ each: true }),
    __metadata("design:type", Array)
], ListJobFiltersDto.prototype, "specialityId", void 0);
__decorate([
    IsOptional(),
    Transform(toArray),
    Type(() => Number),
    IsInt({ each: true }),
    __metadata("design:type", Array)
], ListJobFiltersDto.prototype, "experienceLevelId", void 0);
__decorate([
    IsOptional(),
    Transform(toArray),
    Type(() => Number),
    IsInt({ each: true }),
    __metadata("design:type", Array)
], ListJobFiltersDto.prototype, "contractTypeId", void 0);
__decorate([
    IsOptional(),
    Transform(toArray),
    Type(() => Number),
    IsInt({ each: true }),
    __metadata("design:type", Array)
], ListJobFiltersDto.prototype, "applyTypeId", void 0);
__decorate([
    IsOptional(),
    IsIn(['publishedAt:desc', 'publishedAt:asc']),
    __metadata("design:type", String)
], ListJobFiltersDto.prototype, "sort", void 0);
//# sourceMappingURL=ListJobFiltersDto.js.map