import { Controller, Get } from '@nestjs/common';
import { LocationRepository } from '../repository/LocationRepository';

@Controller('location')
export class LocationController {
    constructor(private readonly locationRepository: LocationRepository) {}

    @Get()
    async list() {
        const items = await this.locationRepository.findAll();
        return { items: items.map((location) => ({ id: location.locationId, name: location.countryName })) };
    }
}
