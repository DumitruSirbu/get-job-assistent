import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { Company } from '../entity/Company';
import { ICompany } from '../interface/ICompany';
import { normalizeStringValue } from 'src/common/utils/normalizeStringValue';
import { ListCompaniesParamsDto } from '../dto/ListCompaniesParamsDto';

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
        const companies = await this.companyRepository.find({ where: { isBlacklisted: false } });
        return new Map(companies.map((company) => [company.companyName, company.companyId]));
    }

    async findWithFilters(dto: ListCompaniesParamsDto): Promise<[Company[], number]> {
        const { page, limit, search, isBlacklisted } = dto;
        const normalizedSearch = normalizeStringValue(search);

        const qb = this.companyRepository.createQueryBuilder('company');

        if (normalizedSearch) {
            qb.where('company.companyName ILIKE :search', { search: `%${normalizedSearch}%` });
        }

        if (typeof isBlacklisted === 'boolean') {
            qb.andWhere('company.isBlacklisted = :isBlacklisted', { isBlacklisted: isBlacklisted });
        }

        qb.orderBy('company.companyName', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        return qb.getManyAndCount();
    }

    async blacklist(companyId: number): Promise<void> {
        await this.companyRepository.update({ companyId }, { isBlacklisted: true });
    }

    async unblacklist(companyId: number): Promise<void> {
        await this.companyRepository.update({ companyId }, { isBlacklisted: false });
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
