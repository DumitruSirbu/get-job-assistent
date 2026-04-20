import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { User } from 'src/module/user/entity/User';
import { CandidateProfile } from 'src/module/candidate/entity/CandidateProfile';
import { JobDescription } from 'src/module/job/entity/JobDescription';
import { ApplyType } from 'src/module/job/entity/ApplyType';
import { ContractType } from 'src/module/job/entity/ContractType';
import { ExperienceLevel } from 'src/module/job/entity/ExperienceLevel';
import { Location } from 'src/module/job/entity/Location';
import { JobRegion } from 'src/module/job-region/entity/JobRegion';
import { Sector } from 'src/module/job/entity/Sector';
import { Speciality } from 'src/module/job/entity/Speciality';
import { ScorerModel } from 'src/module/job-scoring/entity/ScorerModel';
import { JobMatchScore } from 'src/module/job-scoring/entity/JobMatchScore';
import { ApplicationStatus } from 'src/module/candidate-application/entity/ApplicationStatus';
import { CandidateApplication } from 'src/module/candidate-application/entity/CandidateApplication';
import { Company } from 'src/module/company/entity/Company';

export const postgresConnectionConfig: PostgresConnectionOptions = {
    type: 'postgres',
    url: process.env.POSTGRES_URL,
    entities: [
        User,
        CandidateProfile,
        JobDescription,
        ApplyType,
        ContractType,
        ExperienceLevel,
        Location,
        Sector,
        Speciality,
        ScorerModel,
        JobMatchScore,
        ApplicationStatus,
        CandidateApplication,
        Company,
        JobRegion,
    ],
    synchronize: false,
    logging: false,
    migrationsTableName: 'migrations',
};
