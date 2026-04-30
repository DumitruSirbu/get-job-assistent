import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IPaginated, paginate } from 'src/common/interface/IPaginated';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { ListScoresRequestDto } from '../dto/ListScoresRequestDto';
import { JobMatchScore } from '../entity/JobMatchScore';
import { IJobMatchScore } from '../interface/IJobMatchScore';
import { JobScoreVisibilityEnum } from '../../../../lib/sdk/job-scoring/enum/JobScoreVisibilityEnum';

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

    async listForCandidate(candidateId: number, requestParams: ListScoresRequestDto): Promise<IPaginated<JobMatchScore>> {
        const { page, limit, minScore, search, sort, scoredFrom, scoredTo, applicationStatusId, noApplication, companyId, visibility } = requestParams;

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

        if (search) {
            qb.andWhere('job.title ILIKE :search', { search: `%${search}%` });
        }

        if (scoredFrom) {
            qb.andWhere('jobScore.createdAt >= CAST(:scoredFrom AS date)', { scoredFrom });
        }

        if (scoredTo) {
            qb.andWhere("jobScore.createdAt < CAST(:scoredTo AS date) + INTERVAL '1 day'", { scoredTo });
        }

        if (applicationStatusId?.length && noApplication) {
            throw new Error('applicationStatusId and noApplication are mutually exclusive');
        }

        if (applicationStatusId?.length) {
            qb.innerJoin(
                'candidate_application',
                'appStatus',
                'appStatus.job_description_id = job.job_description_id AND appStatus.candidate_profile_id = :candidateId',
                {
                    candidateId,
                },
            ).andWhere('appStatus.application_status_id IN (:...applicationStatusId)', { applicationStatusId });
        }

        if (noApplication) {
            qb.leftJoin(
                'candidate_application',
                'appNone',
                'appNone.job_description_id = job.job_description_id AND appNone.candidate_profile_id = :candidateId',
                {
                    candidateId,
                },
            ).andWhere('appNone.application_id IS NULL');
        }

        if (companyId?.length) {
            qb.andWhere('company.companyId IN (:...companyId)', { companyId });
        }

        switch (visibility) {
            case JobScoreVisibilityEnum.HIDDEN:
                qb.andWhere('jobScore.hidden = true');
                break;
            case JobScoreVisibilityEnum.ALL:
                break;
            default:
                qb.andWhere('jobScore.hidden = false');
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

    async toggleVisibility(jobMatchScoreId: number, hidden: boolean): Promise<JobMatchScore | null> {
        const result = await this.jobMatchScoreRepository.update({ jobMatchScoreId }, { hidden, updatedAt: new Date() });
        if (!result.affected) {
            return null;
        }
        return this.findById(jobMatchScoreId);
    }

    async insertNewScores(items: IJobMatchScore[]): Promise<void> {
        if (!items.length) {
            return;
        }

        await this.insertManyIgnoreConflicts(items);
    }
}
