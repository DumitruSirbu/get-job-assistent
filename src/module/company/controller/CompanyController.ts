import { Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { paginate } from 'src/common/interface/IPaginated';
import { CompanyRepository } from '../repository/CompanyRepository';
import { ListCompaniesParamsDto } from '../dto/ListCompaniesParamsDto';

@Controller('company')
export class CompanyController {
    constructor(private readonly companyRepository: CompanyRepository) {}

    @Get()
    async list(@Query() dto: ListCompaniesParamsDto) {
        const { page, limit } = dto;
        const [companies, total] = await this.companyRepository.findWithFilters(dto);
        const items = companies.map((company) => ({
            id: company.companyId,
            name: company.companyName,
            isBlacklisted: company.isBlacklisted,
        }));

        return paginate(items, total, page, limit);
    }

    @Patch(':id/blacklist')
    async blacklist(@Param('id', ParseIntPipe) id: number) {
        await this.companyRepository.blacklist(id);
    }

    @Patch(':id/unblacklist')
    async unblacklist(@Param('id', ParseIntPipe) id: number) {
        await this.companyRepository.unblacklist(id);
    }
}
