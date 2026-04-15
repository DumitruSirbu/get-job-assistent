import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IPaginated, paginate } from 'src/common/interface/IPaginated';
import { BaseRepository } from 'src/module/job/repository/BaseRepository';
import { ListScoresRequestDto } from '../dto/ListScoresRequestDto';
import { JobMatchScore } from '../entity/JobMatchScore';
import { IJobMatchScore } from '../interface/IJobMatchScore';

@Injectable()
export class JobMatchScoreRepository extends BaseRepository<JobMatchScore> {
    constructor(
        @InjectRepository(JobMatchScore)
        private readonly jobMatchScoreRepository: Repository<JobMatchScore>,
    ) {
        super(jobMatchScoreRepository);
    }

    async findById(jobMatchScoreId: number): Promise<JobMatchScore | null> {
        return this.jobMatchScoreRepository.findOne({ where: { jobMatchScoreId } });
    }

    async findByJobDescriptionId(jobDescriptionId: number): Promise<JobMatchScore[]> {
        return this.jobMatchScoreRepository.find({ where: { jobDescriptionId } });
    }

    async listForCandidate(candidateId: number, dto: ListScoresRequestDto): Promise<IPaginated<JobMatchScore>> {
        const { page, limit, minScore, locationMatch, search, sort } = dto;

        const qb = this.jobMatchScoreRepository
            .createQueryBuilder('jobScore')
            .leftJoinAndSelect('jobScore.jobDescription', 'job')
            .leftJoinAndSelect('job.company', 'company')
            .leftJoinAndSelect('job.location', 'location')
            .leftJoinAndSelect('job.sector', 'sector')
            .leftJoinAndSelect('job.speciality', 'speciality')
            .leftJoinAndSelect('job.experienceLevel', 'experienceLevel')
            .leftJoinAndSelect('job.contractType', 'contractType')
            .leftJoinAndSelect('job.applyType', 'applyType')
            .leftJoinAndSelect('jobScore.scorerModel', 'scorerModel')
            .where('jobScore.candidateProfileId = :candidateId', { candidateId });

        if (minScore !== undefined) {
            qb.andWhere('jobScore.score >= :minScore', { minScore });
        }
        if (locationMatch !== undefined) {
            qb.andWhere(`"jobScore"."reasons_json"->>'locationMatch' = :locationMatch`, {
                locationMatch: String(locationMatch),
            });
        }
        if (search) {
            qb.andWhere('job.title ILIKE :search', { search: `%${search}%` });
        }

        if (sort === 'score:desc') {
            qb.orderBy('jobScore.score', 'DESC');
        } else if (sort === 'score:asc') {
            qb.orderBy('jobScore.score', 'ASC');
        } else {
            qb.orderBy('job.publishedAt', 'DESC');
        }

        qb.skip((page - 1) * limit).take(limit);

        const [items, total] = await qb.getManyAndCount();
        return paginate(items, total, page, limit);
    }

    async insertNewScores(items: IJobMatchScore[]): Promise<void> {
        if (!items.length) {
            return;
        }

        await this.insertManyIgnoreConflicts(items);
    }
}
