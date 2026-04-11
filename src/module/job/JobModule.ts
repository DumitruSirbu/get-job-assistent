import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
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

@Module({
    imports: [TypeOrmModule.forFeature([ApplyType, ContractType, ExperienceLevel, Speciality, Sector, Location, JobDescription, Company]), ApifyModule],
    controllers: [JobDescriptionController],
    providers: [
        JobDescriptionService,
        ApplyTypeRepository,
        ContractTypeRepository,
        ExperienceLevelRepository,
        SpecialityRepository,
        SectorRepository,
        LocationRepository,
        JobDescriptionRepository,
        CompanyRepository,
    ],
})
export class JobModule {}
