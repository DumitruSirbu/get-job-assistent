import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ApifyModule } from '../apify/ApifyModule';
import { ApplyType } from './entity/ApplyType';
import { CandidateProfile } from './entity/CandidateProfile';
import { Company } from './entity/Company';
import { ContractType } from './entity/ContractType';
import { ExperienceLevel } from './entity/ExperienceLevel';
import { JobDescription } from './entity/JobDescription';
import { JobMatchScore } from './entity/JobMatchScore';
import { Sector } from './entity/Sector';
import { Location } from './entity/Location';
import { ScorerModel } from './entity/ScorerModel';
import { Speciality } from './entity/Speciality';
import { JobDescriptionService } from './service/JobDescriptionService';
import { JobDescriptionController } from './controller/JobDescriptionController';
import { ApplyTypeRepository } from './repository/ApplyTypeRepository';
import { CandidateProfileRepository } from './repository/CandidateProfileRepository';
import { ContractTypeRepository } from './repository/ContractTypeRepository';
import { ExperienceLevelRepository } from './repository/ExperienceLevelRepository';
import { JobMatchScoreRepository } from './repository/JobMatchScoreRepository';
import { SpecialityRepository } from './repository/SpecialityRepository';
import { ScorerModelRepository } from './repository/ScorerModelRepository';
import { SectorRepository } from './repository/SectorRepository';
import { LocationRepository } from './repository/LocationRepository';
import { JobDescriptionRepository } from './repository/JobDescriptionRepository';
import { CompanyRepository } from './repository/CompanyRepository';
import { LinkedinJobsProcessor } from './queue/linkedinJobsProcessor';
import { LINKEDIN_JOBS_QUEUE } from './const';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ApplyType,
            CandidateProfile,
            ContractType,
            ExperienceLevel,
            JobDescription,
            JobMatchScore,
            Location,
            ScorerModel,
            Sector,
            Speciality,
            Company,
        ]),
        BullModule.registerQueue({ name: LINKEDIN_JOBS_QUEUE }),
        ApifyModule,
    ],
    controllers: [JobDescriptionController],
    providers: [
        JobDescriptionService,
        ApplyTypeRepository,
        CandidateProfileRepository,
        ContractTypeRepository,
        ExperienceLevelRepository,
        JobDescriptionRepository,
        JobMatchScoreRepository,
        ScorerModelRepository,
        SectorRepository,
        SpecialityRepository,
        LocationRepository,
        CompanyRepository,
        LinkedinJobsProcessor,
    ],
})
export class JobModule {}
