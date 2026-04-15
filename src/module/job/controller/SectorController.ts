import { Controller, Get } from '@nestjs/common';
import { SectorRepository } from '../repository/SectorRepository';

@Controller('sector')
export class SectorController {
    constructor(private readonly sectorRepository: SectorRepository) {}

    @Get()
    async list() {
        const items = await this.sectorRepository.findAll();
        return { items: items.map((sector) => ({ id: sector.sectorId, name: sector.sectorName })) };
    }
}
