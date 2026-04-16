import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/module/job/repository/BaseRepository';
import { CandidateApplication } from '../entity/CandidateApplication';
import { ICandidateApplication } from '../interface/ICandidateApplication';

@Injectable()
export class CandidateApplicationRepository extends BaseRepository<CandidateApplication> {
    constructor(
        @InjectRepository(CandidateApplication)
        private readonly candidateApplicationRepository: Repository<CandidateApplication>,
    ) {
        super(candidateApplicationRepository);
    }

    async findByCandidateId(candidateProfileId: number): Promise<ICandidateApplication[]> {
        const rows = await this.candidateApplicationRepository
            .createQueryBuilder('app')
            .leftJoinAndSelect('app.applicationStatus', 'status')
            .where('app.candidateProfileId = :candidateProfileId', { candidateProfileId })
            .orderBy('app.appliedAt', 'DESC')
            .getMany();

        return rows.map(this.toDto);
    }

    async findByIdAndCandidateId(applicationId: string, candidateProfileId: number): Promise<ICandidateApplication | null> {
        const row = await this.candidateApplicationRepository
            .createQueryBuilder('app')
            .leftJoinAndSelect('app.applicationStatus', 'status')
            .where('app.applicationId = :applicationId', { applicationId })
            .andWhere('app.candidateProfileId = :candidateProfileId', { candidateProfileId })
            .getOne();

        return row ? this.toDto(row) : null;
    }

    async findRawByIdAndCandidateId(applicationId: string, candidateProfileId: number): Promise<CandidateApplication | null> {
        return this.candidateApplicationRepository.findOne({
            where: { applicationId, candidateProfileId },
        });
    }

    async saveEntity(entity: CandidateApplication): Promise<CandidateApplication> {
        return this.candidateApplicationRepository.save(entity);
    }

    async deleteById(applicationId: string): Promise<void> {
        await this.candidateApplicationRepository.delete({ applicationId });
    }

    private toDto(row: CandidateApplication): ICandidateApplication {
        return {
            applicationId: row.applicationId,
            candidateProfileId: row.candidateProfileId,
            jobDescriptionId: row.jobDescriptionId,
            appliedAt: row.appliedAt,
            status: row.applicationStatus?.statusName ?? '',
        };
    }
}
