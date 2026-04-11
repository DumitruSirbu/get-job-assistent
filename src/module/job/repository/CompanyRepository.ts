import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Company } from '../entity/Company';
import { ICompany } from '../interface/ICompany';
import { normalizeStringValue } from '../utils';

@Injectable()
export class CompanyRepository extends BaseRepository<Company> {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
    ) {
        super(companyRepository);
    }

    async findById(companyId: number): Promise<Company | null> {
        return this.companyRepository.findOne({ where: { companyId } });
    }

    async findAllAndMap(): Promise<Map<string, number>> {
        const companies = await this.findAll();
        return new Map(companies.map((company) => [company.companyName, company.companyId]));
    }

    async insertNewCompanies(items: ICompany[]): Promise<void> {
        if (!items.length) {
            return;
        }

        const valuesToInsert = items.map((item) => ({
            companyExternalId: item.companyExternalId,
            companyName: normalizeStringValue(item.companyName),
            companyUrl: normalizeStringValue(item.companyUrl),
        }));

        await this.insertManyIgnoreConflicts(valuesToInsert);
    }
}
