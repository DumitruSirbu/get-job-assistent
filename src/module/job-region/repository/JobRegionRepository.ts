import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { JobRegion } from '../entity/JobRegion';

@Injectable()
export class JobRegionRepository extends BaseRepository<JobRegion> {
    constructor(
        @InjectRepository(JobRegion)
        private readonly jobRegionRepository: Repository<JobRegion>,
    ) {
        super(jobRegionRepository);
    }

    async findAll(): Promise<JobRegion[]> {
        return this.jobRegionRepository.find();
    }

    async findById(id: number): Promise<JobRegion | null> {
        return this.jobRegionRepository.findOneBy({ jobRegionId: id });
    }

    async findByIds(ids: number[]): Promise<JobRegion[]> {
        return this.jobRegionRepository.findBy({ jobRegionId: In(ids) });
    }

    async findDefaults(): Promise<JobRegion[]> {
        return this.jobRegionRepository.findBy({ isSelectedByDefault: true });
    }

    async save(region: JobRegion): Promise<JobRegion> {
        return this.jobRegionRepository.save(region);
    }

    async deleteById(id: number): Promise<void> {
        await this.jobRegionRepository.delete(id);
    }

    build(partial: Partial<JobRegion>): JobRegion {
        return this.jobRegionRepository.create(partial);
    }

    async setDefaults(ids: number[]): Promise<void> {
        await this.jobRegionRepository.manager.transaction(async (manager) => {
            await manager.update(JobRegion, { jobRegionId: Not(In(ids)) }, { isSelectedByDefault: false });
            if (ids.length > 0) {
                await manager.update(JobRegion, { jobRegionId: In(ids) }, { isSelectedByDefault: true });
            }
        });
    }
}
