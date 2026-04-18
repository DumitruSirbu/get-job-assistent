import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateModule } from '../candidate/CandidateModule';
import { ApplicationStatus } from './entity/ApplicationStatus';
import { CandidateApplication } from './entity/CandidateApplication';
import { ApplicationStatusRepository } from './repository/ApplicationStatusRepository';
import { CandidateApplicationRepository } from './repository/CandidateApplicationRepository';
import { CandidateApplicationService } from './service/CandidateApplicationService';
import { CandidateApplicationController } from './controller/CandidateApplicationController';
import { ApplicationStatusController } from './controller/ApplicationStatusController';

@Module({
    imports: [TypeOrmModule.forFeature([ApplicationStatus, CandidateApplication]), CandidateModule],
    controllers: [CandidateApplicationController, ApplicationStatusController],
    providers: [CandidateApplicationService, ApplicationStatusRepository, CandidateApplicationRepository],
})
export class CandidateApplicationModule {}
