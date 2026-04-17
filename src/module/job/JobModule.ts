import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ApifyModule } from '../apify/ApifyModule';
import { CompanyModule } from '../company/CompanyModule';
import { ApplyType } from './entity/ApplyType';
import { ContractType } from './entity/ContractType';
import { ExperienceLevel } from './entity/ExperienceLevel';
import { JobDescription } from './entity/JobDescription';
import { Sector } from './entity/Sector';
import { Location } from './entity/Location';
import { Speciality } from './entity/Speciality';
import { JobDescriptionService } from './service/JobDescriptionService';
import { JobDescriptionController } from './controller/JobDescriptionController';
import { LocationController } from './controller/LocationController';
import { SectorController } from './controller/SectorController';
import { SpecialityController } from './controller/SpecialityController';
import { ExperienceLevelController } from './controller/ExperienceLevelController';
import { ContractTypeController } from './controller/ContractTypeController';
import { ApplyTypeController } from './controller/ApplyTypeController';
import { ApplyTypeRepository } from './repository/ApplyTypeRepository';
import { ContractTypeRepository } from './repository/ContractTypeRepository';
import { ExperienceLevelRepository } from './repository/ExperienceLevelRepository';
import { SpecialityRepository } from './repository/SpecialityRepository';
import { SectorRepository } from './repository/SectorRepository';
import { LocationRepository } from './repository/LocationRepository';
import { JobDescriptionRepository } from './repository/JobDescriptionRepository';
import { LinkedinJobsProcessor } from './queue/linkedinJobsProcessor';
import { LINKEDIN_JOBS_QUEUE } from './const';

@Module({
    imports: [
        TypeOrmModule.forFeature([ApplyType, ContractType, ExperienceLevel, JobDescription, Location, Sector, Speciality]),
        BullModule.registerQueue({ name: LINKEDIN_JOBS_QUEUE }),
        ApifyModule,
        CompanyModule,
    ],
    controllers: [
        JobDescriptionController,
        LocationController,
        SectorController,
        SpecialityController,
        ExperienceLevelController,
        ContractTypeController,
        ApplyTypeController,
    ],
    providers: [
        JobDescriptionService,
        ApplyTypeRepository,
        ContractTypeRepository,
        ExperienceLevelRepository,
        JobDescriptionRepository,
        SectorRepository,
        SpecialityRepository,
        LocationRepository,
        LinkedinJobsProcessor,
    ],
    exports: [
        LocationRepository,
        ExperienceLevelRepository,
        JobDescriptionRepository,
        SectorRepository,
        SpecialityRepository,
        ContractTypeRepository,
        ApplyTypeRepository,
    ],
})
export class JobModule {}
