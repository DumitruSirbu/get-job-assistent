import { Controller, Get } from '@nestjs/common';
import { ApplyTypeRepository } from '../repository/ApplyTypeRepository';

@Controller('apply-type')
export class ApplyTypeController {
    constructor(private readonly applyTypeRepository: ApplyTypeRepository) {}

    @Get()
    async list() {
        const items = await this.applyTypeRepository.findAll();
        return { items: items.map((applyType) => ({ id: applyType.applyTypeId, name: applyType.applyTypeName })) };
    }
}
