import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { ApplicationStatus } from '../entity/ApplicationStatus';

@Injectable()
export class ApplicationStatusRepository extends BaseRepository<ApplicationStatus> {
    constructor(
        @InjectRepository(ApplicationStatus)
        private readonly applicationStatusRepository: Repository<ApplicationStatus>,
    ) {
        super(applicationStatusRepository);
    }

    async findByName(statusName: string): Promise<ApplicationStatus | null> {
        return this.applicationStatusRepository.findOne({ where: { statusName } });
    }
}
