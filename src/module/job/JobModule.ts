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

@Module({
    imports: [TypeOrmModule.forFeature([ApplyType, ContractType, ExperienceLevel, Speciality, Sector, Location, JobDescription, Company]), ApifyModule],
    controllers: [JobDescriptionController],
    providers: [JobDescriptionService],
})
export class JobModule {}
