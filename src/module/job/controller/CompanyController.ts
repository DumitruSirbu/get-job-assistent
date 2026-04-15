import { Controller, Get } from '@nestjs/common';
import { CompanyRepository } from '../repository/CompanyRepository';

@Controller('company')
export class CompanyController {
    constructor(private readonly companyRepository: CompanyRepository) {}

    @Get()
    async list() {
        const items = await this.companyRepository.findAll();
        return { items: items.map((company) => ({ id: company.companyId, name: company.companyName })) };
    }
}
