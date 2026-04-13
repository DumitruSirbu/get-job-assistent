import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ApplyTypeRepository } from '../repository/ApplyTypeRepository';
import { ContractTypeRepository } from '../repository/ContractTypeRepository';
import { ExperienceLevelRepository } from '../repository/ExperienceLevelRepository';
import { JobDescriptionRepository } from '../repository/JobDescriptionRepository';
import { LocationRepository } from '../repository/LocationRepository';
import { SectorRepository } from '../repository/SectorRepository';
import { SpecialityRepository } from '../repository/SpecialityRepository';
import { CompanyRepository } from '../repository/CompanyRepository';
import { ApifyLinkedinJobsService } from 'src/module/apify/service/ApifyLinkedinJobsService';
import { IGetLinkedinJobsParams } from 'src/module/apify/interface/IGetLinkedinJobsParams';
import { ContractTypeEnum, WorkTypeEnum, ExperienceLevelEnum, PublishedAtEnum } from 'src/module/apify/enum';
import {
    ICompany,
    ISector,
    ILocation,
    ISpeciality,
    IContractType,
    IExperienceLevel,
    IApplyType,
    IJobDescription,
    GeneralJobPropertiesMapingsType,
} from '../interface';
import { normalizeStringValue } from '../utils/normalizeStringValue';
import { IJobDescriptionResponse } from 'src/module/apify/interface/IJobDescriptionResponse';
import jobsList from '../jobsList.json';
import { LINKEDIN_JOBS_QUEUE, LINKEDIN_JOBS_JOB_NAME } from '../const';
import type { ILinkedinJobsQueuePayload } from '../interface/ILinkedinJobsQueuePayload';

@Injectable()
export class JobDescriptionService {
    private readonly logger = new Logger(JobDescriptionService.name);

    private readonly locations = ['Moldova', 'Netherlands', 'Denmark', 'France', 'Germany', 'Sweeden', 'Norway', 'Austria', 'Switzerland', 'Luxembourg'];

    constructor(
        private readonly applyTypeRepository: ApplyTypeRepository,
        private readonly contractTypeRepository: ContractTypeRepository,
        private readonly experienceLevelRepository: ExperienceLevelRepository,
        private readonly specialityRepository: SpecialityRepository,
        private readonly sectorRepository: SectorRepository,
        private readonly locationRepository: LocationRepository,
        private readonly jobDescriptionRepository: JobDescriptionRepository,
        private readonly apifyLinkedinJobsService: ApifyLinkedinJobsService,
        private readonly companyRepository: CompanyRepository,
        @InjectQueue(LINKEDIN_JOBS_QUEUE) private readonly linkedinJobsQueue: Queue,
    ) {}

    async dispatchProcessNewJobs(): Promise<number> {
        const jobOptions = {
            attempts: 3,
            backoff: { type: 'exponential' as const, delay: 5000 },
            removeOnComplete: true,
            removeOnFail: false,
        };

        const jobs = await Promise.all(
            this.locations.map(async (location) => {
                const payload: ILinkedinJobsQueuePayload = { location };
                return await this.linkedinJobsQueue.add(LINKEDIN_JOBS_JOB_NAME, payload, jobOptions);
            }),
        );

        this.logger.log(`Dispatched ${jobs.length} location jobs: ${this.locations.join(', ')}`);
        return jobs.length;
    }

    async processFromFile(): Promise<void> {
        await this.processGetJobsResults(jobsList as IJobDescriptionResponse[]);
    }

    async processJobsByLocation(location: string): Promise<void> {
        const fetchJobsParams: IGetLinkedinJobsParams = {
            contractType: ContractTypeEnum.FULL_TIME,
            experienceLevel: ExperienceLevelEnum.MID_SENIOR,
            location,
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

        const rawJobsList = await this.apifyLinkedinJobsService.fetchJobs(fetchJobsParams);

        await this.processGetJobsResults(rawJobsList);
    }

    private async processGetJobsResults(rawJobsList: IJobDescriptionResponse[]): Promise<void> {
        let jobPropertiesMap: Map<string, IJobDescription> = new Map();

        await this.addMissingJobProperties(rawJobsList);

        const generalJobPropertiesMapings: GeneralJobPropertiesMapingsType = await this.getGeneralJobPropertiesMapings();

        for (const job of rawJobsList) {
            let newJobDescription: Partial<IJobDescription> = {
                jobExternalId: Number(job.id),
                title: job.title,
                description: job.description,
                jobUrl: job.jobUrl,
                postedTime: job.postedTime,
                publishedAt: job.publishedAt,
                applyUrl: job.applyUrl,
                benefits: job.benefits,
                descriptionHtml: job.descriptionHtml,
                posterProfileUrl: job.posterProfileUrl,
                posterFullName: job.posterFullName,
                salary: job.salary,
                applicationsCount: job.applicationsCount,
            };

            newJobDescription = this.setGeneralJobPropertiesIds(generalJobPropertiesMapings, job, newJobDescription);

            if (
                !newJobDescription.companyId ||
                !newJobDescription.sectorId ||
                !newJobDescription.locationId ||
                !newJobDescription.specialityId ||
                !newJobDescription.contractTypeId ||
                !newJobDescription.experienceLevelId ||
                !newJobDescription.applyTypeId
            ) {
                continue;
            }

            jobPropertiesMap = this.addToMap<IJobDescription>(jobPropertiesMap, job.id, newJobDescription as IJobDescription);
        }

        await this.jobDescriptionRepository.insertNewJobDescriptions(Array.from(jobPropertiesMap.values()));
    }

    async getGeneralJobPropertiesMapings(): Promise<GeneralJobPropertiesMapingsType> {
        const [companiesMap, sectorsMap, locationsMap, specialitiesMap, contractTypesMap, experienceLevelsMap, applyTypesMap] = await Promise.all([
            this.companyRepository.findAllAndMap(),
            this.sectorRepository.findAllAndMap(),
            this.locationRepository.findAllAndMap(),
            this.specialityRepository.findAllAndMap(),
            this.contractTypeRepository.findAllAndMap(),
            this.experienceLevelRepository.findAllAndMap(),
            this.applyTypeRepository.findAllAndMap(),
        ]);

        return {
            companiesMap,
            sectorsMap,
            locationsMap,
            specialitiesMap,
            contractTypesMap,
            experienceLevelsMap,
            applyTypesMap,
        };
    }

    private async addMissingJobProperties(jobList: IJobDescriptionResponse[]): Promise<void> {
        let newCompanies: Map<string, ICompany> = new Map();
        let newSectors: Map<string, ISector> = new Map();
        let newLocations: Map<string, ILocation> = new Map();
        let newSpecialities: Map<string, ISpeciality> = new Map();
        let newContractTypes: Map<string, IContractType> = new Map();
        let newExperienceLevels: Map<string, IExperienceLevel> = new Map();
        let newApplyTypes: Map<string, IApplyType> = new Map();

        for (const job of jobList) {
            newCompanies = this.addToMap<ICompany>(newCompanies, job.companyId, {
                companyName: job.companyName,
                companyExternalId: Number(job.companyId),
                companyUrl: job.companyUrl,
            });
            newSectors = this.addToMap<ISector>(newSectors, job.sector, { sectorName: job.sector });
            newLocations = this.addToMap<ILocation>(newLocations, job.location, { countryName: job.location });
            newSpecialities = this.addToMap<ISpeciality>(newSpecialities, job.workType, { specialityName: job.workType });
            newContractTypes = this.addToMap<IContractType>(newContractTypes, job.contractType, { contractTypeName: job.contractType });
            newExperienceLevels = this.addToMap<IExperienceLevel>(newExperienceLevels, job.experienceLevel, { experienceLevelName: job.experienceLevel });
            newApplyTypes = this.addToMap<IApplyType>(newApplyTypes, job.applyType, { applyTypeName: job.applyType });
        }

        await Promise.all([
            this.companyRepository.insertNewCompanies(Array.from(newCompanies.values())),
            this.sectorRepository.insertNewSectors(Array.from(newSectors.values())),
            this.locationRepository.insertNewLocations(Array.from(newLocations.values())),
            this.specialityRepository.insertNewSpecialities(Array.from(newSpecialities.values())),
            this.contractTypeRepository.insertNewContractTypes(Array.from(newContractTypes.values())),
            this.experienceLevelRepository.insertNewExperienceLevels(Array.from(newExperienceLevels.values())),
            this.applyTypeRepository.insertNewApplyTypes(Array.from(newApplyTypes.values())),
        ]);
    }

    private setGeneralJobPropertiesIds(
        generalJobPropertiesMapings: GeneralJobPropertiesMapingsType,
        originalJobObject: IJobDescriptionResponse,
        newJobDescription: Partial<IJobDescription>,
    ) {
        const { companiesMap, sectorsMap, locationsMap, specialitiesMap, contractTypesMap, experienceLevelsMap, applyTypesMap } = generalJobPropertiesMapings;

        const companyName = normalizeStringValue(originalJobObject.companyName);
        const sector = normalizeStringValue(originalJobObject.sector);
        const location = normalizeStringValue(originalJobObject.location);
        const workType = normalizeStringValue(originalJobObject.workType);
        const contractType = normalizeStringValue(originalJobObject.contractType);
        const experienceLevel = normalizeStringValue(originalJobObject.experienceLevel);
        const applyType = normalizeStringValue(originalJobObject.applyType);

        newJobDescription = this.assignIdIfExists('companyId', companiesMap, newJobDescription, companyName);
        newJobDescription = this.assignIdIfExists('sectorId', sectorsMap, newJobDescription, sector);
        newJobDescription = this.assignIdIfExists('locationId', locationsMap, newJobDescription, location);
        newJobDescription = this.assignIdIfExists('specialityId', specialitiesMap, newJobDescription, workType);
        newJobDescription = this.assignIdIfExists('contractTypeId', contractTypesMap, newJobDescription, contractType);
        newJobDescription = this.assignIdIfExists('experienceLevelId', experienceLevelsMap, newJobDescription, experienceLevel);
        newJobDescription = this.assignIdIfExists('applyTypeId', applyTypesMap, newJobDescription, applyType);

        return newJobDescription;
    }

    assignIdIfExists = <K extends keyof IJobDescription>(
        field: K,
        sourceMap: Map<string, number>,
        newJobDescription: Partial<IJobDescription>,
        value?: string,
    ): Partial<IJobDescription> => {
        if (!value) {
            return newJobDescription;
        }

        const normalizedValue = normalizeStringValue(value);
        if (!normalizedValue) {
            return newJobDescription;
        }

        const id = sourceMap.get(normalizedValue);
        if (id !== undefined) {
            newJobDescription[field] = id as IJobDescription[K];
        }

        return newJobDescription;
    };

    private addToSet(currentSet: Set<string>, item: string): Set<string> {
        if (!item || currentSet.has(item)) {
            return currentSet;
        }

        currentSet.add(item);

        return currentSet;
    }

    private addToMap<T>(currentMap: Map<string, T>, key: string, item: T): Map<string, T> {
        if (!item || currentMap.has(key)) {
            return currentMap;
        }

        currentMap.set(key, item);

        return currentMap;
    }
}
