import { Controller, Get } from '@nestjs/common';
import { SpecialityRepository } from '../repository/SpecialityRepository';

@Controller('speciality')
export class SpecialityController {
    constructor(private readonly specialityRepository: SpecialityRepository) {}

    @Get()
    async list() {
        const items = await this.specialityRepository.findAll();
        return { items: items.map((speciality) => ({ id: speciality.specialityId, name: speciality.specialityName })) };
    }
}
