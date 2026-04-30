import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IPaginated, paginate } from 'src/common/interface/IPaginated';
import { ListJobFiltersDto } from 'lib/sdk/job/dto';
import { IScoreNewestJobsParams } from 'lib/sdk/job-scoring/interface';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { JobDescription } from '../entity/JobDescription';
import { IJobDescription } from '../interface/IJobDescription';

@Injectable()
export class JobDescriptionRepository extends BaseRepository<JobDescription> {
    constructor(
        @InjectRepository(JobDescription)
        private readonly jobDescriptionRepository: Repository<JobDescription>,
    ) {
        super(jobDescriptionRepository);
    }

    async findById(jobDescriptionId: number): Promise<JobDescription | null> {
        return this.jobDescriptionRepository.findOne({ where: { jobDescriptionId } });
    }

    async findByIdWithRelations(id: number): Promise<JobDescription> {
        const job = await this.jobDescriptionRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.company', 'company')
            .leftJoinAndSelect('job.location', 'location')
            .leftJoinAndSelect('job.sector', 'sector')
            .leftJoinAndSelect('job.speciality', 'speciality')
            .leftJoinAndSelect('job.experienceLevel', 'experienceLevel')
            .leftJoinAndSelect('job.contractType', 'contractType')
            .leftJoinAndSelect('job.applyType', 'applyType')
            .where('job.jobDescriptionId = :id', { id })
            .getOne();

        if (!job) {
            throw new NotFoundException(`JobDescription ${id} not found`);
        }

        return job;
    }

    async listWithFilters(dto: ListJobFiltersDto): Promise<IPaginated<JobDescription>> {
        const {
            page,
            limit,
            search,
            publishedFrom,
            publishedTo,
            companyId,
            locationId,
            sectorId,
            specialityId,
            experienceLevelId,
            contractTypeId,
            applyTypeId,
            sort,
        } = dto;

        const qb = this.jobDescriptionRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.company', 'company')
            .leftJoinAndSelect('job.location', 'location')
            .leftJoinAndSelect('job.sector', 'sector')
            .leftJoinAndSelect('job.speciality', 'speciality')
            .leftJoinAndSelect('job.experienceLevel', 'experienceLevel')
            .leftJoinAndSelect('job.contractType', 'contractType')
            .leftJoinAndSelect('job.applyType', 'applyType');

        if (search) {
            qb.andWhere('(job.title ILIKE :search OR job.description ILIKE :search)', { search: `%${search}%` });
        }
        if (publishedFrom) {
            qb.andWhere('job.publishedAt >= CAST(:publishedFrom AS date)', { publishedFrom });
        }
        if (publishedTo) {
            qb.andWhere("job.publishedAt < CAST(:publishedTo AS date) + INTERVAL '1 day'", { publishedTo });
        }
        if (companyId?.length) {
            qb.andWhere('job.companyId IN (:...companyId)', { companyId });
        }
        if (locationId?.length) {
            qb.andWhere('job.locationId IN (:...locationId)', { locationId });
        }
        if (sectorId?.length) {
            qb.andWhere('job.sectorId IN (:...sectorId)', { sectorId });
        }
        if (specialityId?.length) {
            qb.andWhere('job.specialityId IN (:...specialityId)', { specialityId });
        }
        if (experienceLevelId?.length) {
            qb.andWhere('job.experienceLevelId IN (:...experienceLevelId)', { experienceLevelId });
        }
        if (contractTypeId?.length) {
            qb.andWhere('job.contractTypeId IN (:...contractTypeId)', { contractTypeId });
        }
        if (applyTypeId?.length) {
            qb.andWhere('job.applyTypeId IN (:...applyTypeId)', { applyTypeId });
        }

        const [field, direction] = sort.split(':') as ['publishedAt', 'asc' | 'desc'];
        qb.orderBy(`job.${field}`, direction.toUpperCase() as 'ASC' | 'DESC');
        qb.skip((page - 1) * limit).take(limit);

        const [items, total] = await qb.getManyAndCount();
        return paginate(items, total, page, limit);
    }

    async findUnscoredByCandidateAndScorer(
        candidateProfileId: number,
        scorerModelId: number,
        version: string,
        params: IScoreNewestJobsParams = {},
    ): Promise<Pick<JobDescription, 'jobDescriptionId'>[]> {
        const qb = this.jobDescriptionRepository
            .createQueryBuilder('jobDescription')
            .select('jobDescription.jobDescriptionId', 'jobDescriptionId')
            .leftJoin('jobDescription.company', 'company')
            .where(
                `NOT EXISTS (
                    SELECT 1
                    FROM job_match_score jobMatchScore
                    WHERE jobMatchScore.job_description_id = "jobDescription".job_description_id
                      AND jobMatchScore.candidate_profile_id = :candidateProfileId
                      AND jobMatchScore.scorer_model_id = :scorerModelId
                      AND jobMatchScore.version = :version
                )`,
                { candidateProfileId, scorerModelId, version },
            )
            // Companies blacklisted at scoring time are excluded so we don't waste
            // paid LLM calls on jobs the user has already opted out of.
            .andWhere('company.is_blacklisted IS NOT TRUE')
            .orderBy('jobDescription.publishedAt', 'DESC')
            .limit(params.limit ?? 300);

        if (params.titleKeyword) {
            qb.andWhere('jobDescription.title ILIKE :titleKeyword', {
                titleKeyword: `%${params.titleKeyword}%`,
            });
        }

        if (params.publishedFrom) {
            qb.andWhere('jobDescription.publishedAt >= CAST(:publishedFrom AS date)', { publishedFrom: params.publishedFrom });
        }

        if (params.publishedTo) {
            qb.andWhere("jobDescription.publishedAt < CAST(:publishedTo AS date) + INTERVAL '1 day'", { publishedTo: params.publishedTo });
        }

        return qb.getRawMany<Pick<JobDescription, 'jobDescriptionId'>>();
    }

    async insertNewJobDescriptions(items: IJobDescription[]): Promise<void> {
        if (!items.length) {
            return;
        }

        const deduped = new Map<number, IJobDescription>();
        for (const item of items) {
            const jobExternalId = item.jobExternalId;
            if (!jobExternalId || deduped.has(jobExternalId)) {
                continue;
            }

            deduped.set(jobExternalId, item);
        }

        const valuesToInsert = Array.from(deduped.values());

        await this.insertManyIgnoreConflicts(valuesToInsert);
    }
}
