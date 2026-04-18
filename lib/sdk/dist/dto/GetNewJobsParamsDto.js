"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNewJobsParamsDto = void 0;
const class_validator_1 = require("class-validator");
const enum_1 = require("../enum");
class GetNewJobsParamsDto {
}
exports.GetNewJobsParamsDto = GetNewJobsParamsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetNewJobsParamsDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enum_1.ContractTypeEnum),
    __metadata("design:type", String)
], GetNewJobsParamsDto.prototype, "contractType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enum_1.ExperienceLevelEnum),
    __metadata("design:type", String)
], GetNewJobsParamsDto.prototype, "experienceLevel", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enum_1.PublishedAtEnum),
    __metadata("design:type", String)
], GetNewJobsParamsDto.prototype, "publishedAt", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enum_1.WorkTypeEnum),
    __metadata("design:type", String)
], GetNewJobsParamsDto.prototype, "workType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(enum_1.LocationEnum, { each: true }),
    __metadata("design:type", Array)
], GetNewJobsParamsDto.prototype, "locations", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], GetNewJobsParamsDto.prototype, "rows", void 0);
