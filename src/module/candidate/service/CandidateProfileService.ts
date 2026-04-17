import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { PaginationDto } from 'src/common/dto/PaginationDto';
import { IPaginated, paginate } from 'src/common/interface/IPaginated';
import { OllamaCvService } from 'src/module/ollama/service/OllamaCvService';
import { LocationRepository } from 'src/module/job/repository/LocationRepository';
import { ExperienceLevelRepository } from 'src/module/job/repository/ExperienceLevelRepository';
import { CandidateProfile } from '../entity/CandidateProfile';
import { CandidateProfileRepository } from '../repository/CandidateProfileRepository';
import { ICandidateProfileLanguage } from '../interface/ICandidateProfileLanguage';
import { ICandidateProfileSkill } from '../interface/ICandidateProfileSkill';

@Injectable()
export class CandidateProfileService {
    private readonly logger = new Logger(CandidateProfileService.name);

    constructor(
        private readonly ollamaCvService: OllamaCvService,
        private readonly candidateProfileRepository: CandidateProfileRepository,
        private readonly experienceLevelRepository: ExperienceLevelRepository,
        private readonly locationRepository: LocationRepository,
    ) {}

    async list(dto: PaginationDto): Promise<IPaginated<object>> {
        const { page, limit } = dto;

        const [candidates, total] = await this.candidateProfileRepository.findPaginatedWithRelations((page - 1) * limit, limit);

        const items = candidates.map((candidate) => ({
            ...candidate,
            skillsCount: Array.isArray(candidate.skillsJson) ? candidate.skillsJson.length : 0,
        }));

        return paginate(items, total, page, limit);
    }

    async findById(id: number): Promise<object> {
        const candidate = await this.candidateProfileRepository.findByIdWithRelations(id);

        if (!candidate) {
            throw new NotFoundException(`CandidateProfile ${id} not found`);
        }

        return {
            ...candidate,
            skillsJson: Array.isArray(candidate.skillsJson) ? candidate.skillsJson : (candidate.skillsJson ?? []),
        };
    }

    async processCV(version: string): Promise<CandidateProfile> {
        const cvPath = resolve('src', 'cv', `cv-${version}.txt`);
        this.logger.log(`Reading CV from ${cvPath}`);

        const cvRawText = await readFile(cvPath, 'utf-8');

        this.logger.log('Sending CV to Ollama for structured extraction');
        const parsed = await this.ollamaCvService.extractCvProfile(cvRawText);

        const [locationsMap, experienceLevelsMap] = await Promise.all([
            this.locationRepository.findAllAndMap(),
            this.experienceLevelRepository.findAllAndMap(),
        ]);

        const locationId = locationsMap.get(parsed.location) ?? null;
        const experienceLevelId = experienceLevelsMap.get(parsed.experienceLevel) ?? null;

        if (!locationId) {
            this.logger.warn(`Location "${parsed.location}" not found in DB — storing without locationId`);
        }

        if (!experienceLevelId) {
            this.logger.warn(`Experience level "${parsed.experienceLevel}" not found in DB — storing without experienceLevelId`);
        }

        const skills: ICandidateProfileSkill[] = parsed.skills.map((s) => ({
            name: s.name,
            level: s.level,
            confidence: s.confidence,
        }));

        const languages: ICandidateProfileLanguage[] = parsed.languages.map((l) => ({
            name: l.name,
            level: l.level,
        }));

        this.logger.log(`Upserting candidate profile for "${parsed.fullName}"`);

        return this.candidateProfileRepository.upsert({
            fullName: parsed.fullName,
            headline: parsed.headline,
            openToRemote: parsed.openToRemote,
            email: parsed.email,
            phone: parsed.phone,
            linkedinUrl: parsed.linkedinUrl,
            yearsExperience: parsed.yearsExperience,
            skillsJson: skills,
            languagesJson: languages,
            version,
            locationId,
            experienceLevelId,
            cvRawText,
        });
    }
}
