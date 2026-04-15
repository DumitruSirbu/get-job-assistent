import { Controller, Get } from '@nestjs/common';
import { ExperienceLevelRepository } from '../repository/ExperienceLevelRepository';

@Controller('experience-level')
export class ExperienceLevelController {
    constructor(private readonly experienceLevelRepository: ExperienceLevelRepository) {}

    @Get()
    async list() {
        const items = await this.experienceLevelRepository.findAll();
        return { items: items.map((level) => ({ id: level.experienceLevelId, name: level.experienceLevelName })) };
    }
}
