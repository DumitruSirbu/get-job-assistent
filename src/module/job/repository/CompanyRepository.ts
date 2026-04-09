import { Company } from '../entity/Company';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';

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
}
