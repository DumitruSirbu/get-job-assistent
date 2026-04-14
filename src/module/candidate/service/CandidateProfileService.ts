import { Injectable, Logger } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { OllamaCvService } from 'src/module/ollama/service/OllamaCvService';
import { LocationRepository } from 'src/module/job/repository/LocationRepository';
import { ExperienceLevelRepository } from 'src/module/job/repository/ExperienceLevelRepository';
import { CandidateProfile } from '../entity/CandidateProfile';
import { CandidateProfileRepository } from '../repository/CandidateProfileRepository';

@Injectable()
export class CandidateProfileService {
    private readonly logger = new Logger(CandidateProfileService.name);

    constructor(
        private readonly ollamaCvService: OllamaCvService,
        private readonly candidateProfileRepository: CandidateProfileRepository,
        private readonly experienceLevelRepository: ExperienceLevelRepository,
        private readonly locationRepository: LocationRepository,
    ) {}

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

        this.logger.log(`Upserting candidate profile for "${parsed.fullName}"`);

        return this.candidateProfileRepository.upsert({
            fullName: parsed.fullName,
            headline: parsed.headline,
            openToRemote: parsed.openToRemote,
            email: parsed.email,
            phone: parsed.phone,
            linkedinUrl: parsed.linkedinUrl,
            yearsExperience: parsed.yearsExperience,
            skillsJson: parsed.skills,
            version,
            locationId,
            experienceLevelId,
            cvRawText,
        });
    }
}
