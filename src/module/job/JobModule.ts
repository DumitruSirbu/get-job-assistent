import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ApifyModule } from '../apify/ApifyModule';
import { ApplyType } from './entity/ApplyType';
import { Company } from './entity/Company';
import { ContractType } from './entity/ContractType';
import { ExperienceLevel } from './entity/ExperienceLevel';
import { JobDescription } from './entity/JobDescription';
import { Sector } from './entity/Sector';
import { Location } from './entity/Location';
import { Speciality } from './entity/Speciality';
import { JobDescriptionService } from './service/JobDescriptionService';
import { JobDescriptionController } from './controller/JobDescriptionController';
import { ApplyTypeRepository } from './repository/ApplyTypeRepository';
import { ContractTypeRepository } from './repository/ContractTypeRepository';
import { ExperienceLevelRepository } from './repository/ExperienceLevelRepository';
import { SpecialityRepository } from './repository/SpecialityRepository';
import { SectorRepository } from './repository/SectorRepository';
import { LocationRepository } from './repository/LocationRepository';
import { JobDescriptionRepository } from './repository/JobDescriptionRepository';
import { CompanyRepository } from './repository/CompanyRepository';
import { LinkedinJobsProcessor } from './queue/linkedinJobsProcessor';
import { LINKEDIN_JOBS_QUEUE } from './const';

@Module({
    imports: [
        TypeOrmModule.forFeature([ApplyType, Company, ContractType, ExperienceLevel, JobDescription, Location, Sector, Speciality]),
        BullModule.registerQueue({ name: LINKEDIN_JOBS_QUEUE }),
        ApifyModule,
    ],
    controllers: [JobDescriptionController],
    providers: [
        JobDescriptionService,
        ApplyTypeRepository,
        ContractTypeRepository,
        ExperienceLevelRepository,
        JobDescriptionRepository,
        SectorRepository,
        SpecialityRepository,
        LocationRepository,
        CompanyRepository,
        LinkedinJobsProcessor,
    ],
    exports: [LocationRepository, ExperienceLevelRepository, JobDescriptionRepository],
})
export class JobModule {}
