import { Injectable } from '@nestjs/common';
import { ApplyTypeRepository } from '../repository/ApplyTypeRepository';
import { ContractTypeRepository } from '../repository/ContractTypeRepository';
import { ExperienceLevelRepository } from '../repository/ExperienceLevelRepository';
import { JobDescriptionRepository } from '../repository/JobDescriptionRepository';
import { LocationRepository } from '../repository/LocationRepository';
import { SectorRepository } from '../repository/SectorRepository';
import { SpecialityRepository } from '../repository/SpecialityRepository';
import { ApifyLinkedinJobsService } from 'src/module/apify/service/ApifyLinkedinJobsService';
import { IGetLinkedinJobsParams } from 'src/module/apify/interface/IGetLinkedinJobsParams';
import { ContractTypeEnum, WorkTypeEnum, ExperienceLevelEnum, PublishedAtEnum } from 'src/module/apify/enum';

@Injectable()
export class JobDescriptionService {
    constructor(
        private readonly applyTypeRepository: ApplyTypeRepository,
        private readonly contractRepository: ContractTypeRepository,
        private readonly experienceRepository: ExperienceLevelRepository,
        private readonly specialityRepository: SpecialityRepository,
        private readonly sectorRepository: SectorRepository,
        private readonly locationRepository: LocationRepository,
        private readonly jobDescriptionRepository: JobDescriptionRepository,
        private readonly apifyLinkedinJobsService: ApifyLinkedinJobsService,
    ) {}

    async processNewJobs() {
        const fetchJobsParams: IGetLinkedinJobsParams = {
            contractType: ContractTypeEnum.FULL_TIME,
            experienceLevel: ExperienceLevelEnum.MID_SENIOR,
            location: 'Netherlands, Denmark, United Kingdom, Moldova, France, Germany',
            proxy: {
                useApifyProxy: true,
                apifyProxyGroups: [],
                apifyProxyCountry: 'US',
            },
            publishedAt: PublishedAtEnum.PAST_WEEK,
            rows: 1000,
            title: 'Senior Backend Engineer',
            workType: WorkTypeEnum.REMOTE,
        };

        const getJobsResponse = await this.apifyLinkedinJobsService.fetchJobs(fetchJobsParams);

        for (const job of getJobsResponse) {
            console.log(job);
        }
    }
}
