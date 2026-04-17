import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { CandidateProfile } from '../entity/CandidateProfile';
import { ICandidateProfile } from '../interface/ICandidateProfile';

@Injectable()
export class CandidateProfileRepository extends BaseRepository<CandidateProfile> {
    constructor(
        @InjectRepository(CandidateProfile)
        private readonly candidateProfileRepository: Repository<CandidateProfile>,
    ) {
        super(candidateProfileRepository);
    }

    async findById(candidateProfileId: number): Promise<CandidateProfile | null> {
        return this.candidateProfileRepository.findOne({ where: { candidateProfileId } });
    }

    async findByIdWithRelations(candidateProfileId: number): Promise<CandidateProfile | null> {
        return this.candidateProfileRepository.findOne({
            where: { candidateProfileId },
            relations: ['location', 'experienceLevel'],
        });
    }

    async findPaginatedWithRelations(skip: number, take: number): Promise<[CandidateProfile[], number]> {
        return this.candidateProfileRepository.findAndCount({
            relations: ['location', 'experienceLevel'],
            order: { createdAt: 'DESC' },
            skip,
            take,
        });
    }

    async findLatest(): Promise<CandidateProfile | null> {
        const [latest] = await this.candidateProfileRepository.find({
            order: { createdAt: 'DESC' },
            take: 1,
        });

        return latest ?? null;
    }

    async upsert(item: ICandidateProfile): Promise<CandidateProfile> {
        const entity = this.candidateProfileRepository.create(item);
        return this.candidateProfileRepository.save(entity);
    }
}
