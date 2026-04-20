import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobRegionDto, UpdateJobRegionDto } from '../../../../lib/sdk';
import { JobRegion } from '../entity/JobRegion';
import { JobRegionRepository } from '../repository/JobRegionRepository';

@Injectable()
export class JobRegionService {
    constructor(private readonly jobRegionRepository: JobRegionRepository) {}

    async findAll(): Promise<JobRegion[]> {
        return this.jobRegionRepository.findAll();
    }

    async create(jobRegion: CreateJobRegionDto): Promise<JobRegion> {
        const region = this.jobRegionRepository.build(jobRegion);
        return this.jobRegionRepository.save(region);
    }

    async update(id: number, updatedJobRegion: UpdateJobRegionDto): Promise<JobRegion> {
        const region = await this.jobRegionRepository.findById(id);
        if (!region) {
            throw new NotFoundException(`Region ${id} not found`);
        }

        Object.assign(region, updatedJobRegion);

        return this.jobRegionRepository.save(region);
    }

    async delete(id: number): Promise<void> {
        const region = await this.jobRegionRepository.findById(id);
        if (!region) {
            throw new NotFoundException(`Region ${id} not found`);
        }

        await this.jobRegionRepository.deleteById(id);
    }
}
