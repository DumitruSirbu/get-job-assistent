import { Controller, Get } from '@nestjs/common';
import { ContractTypeRepository } from '../repository/ContractTypeRepository';

@Controller('contract-type')
export class ContractTypeController {
    constructor(private readonly contractTypeRepository: ContractTypeRepository) {}

    @Get()
    async list() {
        const items = await this.contractTypeRepository.findAll();
        return { items: items.map((contractType) => ({ id: contractType.contractTypeId, name: contractType.contractTypeName })) };
    }
}
