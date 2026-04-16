import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CandidateProfileRepository } from 'src/module/candidate/repository/CandidateProfileRepository';
import { CandidateApplicationRepository } from '../repository/CandidateApplicationRepository';
import { ApplicationStatusRepository } from '../repository/ApplicationStatusRepository';
import { CandidateApplication } from '../entity/CandidateApplication';
import { CreateCandidateApplicationDto } from '../dto/CreateCandidateApplicationDto';
import { UpdateCandidateApplicationDto } from '../dto/UpdateCandidateApplicationDto';
import { ICandidateApplication } from '../interface/ICandidateApplication';

const DEFAULT_STATUS_NAME = 'applied';

@Injectable()
export class CandidateApplicationService {
    constructor(
        private readonly candidateApplicationRepository: CandidateApplicationRepository,
        private readonly applicationStatusRepository: ApplicationStatusRepository,
        private readonly candidateProfileRepository: CandidateProfileRepository,
    ) {}

    async listApplications(candidateProfileId: number): Promise<{ items: ICandidateApplication[] }> {
        await this.assertCandidateExists(candidateProfileId);
        const items = await this.candidateApplicationRepository.findByCandidateId(candidateProfileId);
        return { items };
    }

    async createApplication(candidateProfileId: number, dto: CreateCandidateApplicationDto): Promise<ICandidateApplication> {
        await this.assertCandidateExists(candidateProfileId);

        const statusName = dto.statusName ?? DEFAULT_STATUS_NAME;
        const status = await this.applicationStatusRepository.findByName(statusName);
        if (!status) {
            throw new BadRequestException(`Unknown status: ${statusName}`);
        }

        const entity = new CandidateApplication();
        entity.candidateProfileId = candidateProfileId;
        entity.jobDescriptionId = dto.jobDescriptionId;
        entity.applicationStatusId = status.applicationStatusId;
        if (dto.appliedAt) {
            entity.appliedAt = new Date(dto.appliedAt);
        }

        try {
            await this.candidateApplicationRepository.saveEntity(entity);
        } catch (err: any) {
            if (err?.code === '23505') {
                throw new ConflictException('Application already exists for this candidate and job');
            }
            throw err;
        }

        const created = await this.candidateApplicationRepository.findByIdAndCandidateId(entity.applicationId, candidateProfileId);
        return created!;
    }

    async findApplication(candidateProfileId: number, applicationId: string): Promise<ICandidateApplication> {
        await this.assertCandidateExists(candidateProfileId);
        const application = await this.candidateApplicationRepository.findByIdAndCandidateId(applicationId, candidateProfileId);
        if (!application) {
            throw new NotFoundException(`Application ${applicationId} not found`);
        }
        return application;
    }

    async updateApplication(candidateProfileId: number, applicationId: string, dto: UpdateCandidateApplicationDto): Promise<ICandidateApplication> {
        await this.assertCandidateExists(candidateProfileId);

        const entity = await this.candidateApplicationRepository.findRawByIdAndCandidateId(applicationId, candidateProfileId);
        if (!entity) {
            throw new NotFoundException(`Application ${applicationId} not found`);
        }

        if (dto.statusName !== undefined) {
            const status = await this.applicationStatusRepository.findByName(dto.statusName);
            if (!status) {
                throw new BadRequestException(`Unknown status: ${dto.statusName}`);
            }
            entity.applicationStatusId = status.applicationStatusId;
        }

        if (dto.appliedAt !== undefined) {
            entity.appliedAt = new Date(dto.appliedAt);
        }

        await this.candidateApplicationRepository.saveEntity(entity);

        const updated = await this.candidateApplicationRepository.findByIdAndCandidateId(applicationId, candidateProfileId);
        return updated!;
    }

    async deleteApplication(candidateProfileId: number, applicationId: string): Promise<void> {
        await this.assertCandidateExists(candidateProfileId);

        const entity = await this.candidateApplicationRepository.findRawByIdAndCandidateId(applicationId, candidateProfileId);
        if (!entity) {
            throw new NotFoundException(`Application ${applicationId} not found`);
        }

        await this.candidateApplicationRepository.deleteById(applicationId);
    }

    private async assertCandidateExists(candidateProfileId: number): Promise<void> {
        const candidate = await this.candidateProfileRepository.findById(candidateProfileId);
        if (!candidate) {
            throw new NotFoundException(`Candidate profile ${candidateProfileId} not found`);
        }
    }
}
