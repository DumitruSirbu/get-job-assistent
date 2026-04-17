import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { Location } from '../entity/Location';
import { ILocation } from '../interface';
import { normalizeStringValue } from 'src/common/utils/normalizeStringValue';

@Injectable()
export class LocationRepository extends BaseRepository<Location> {
    constructor(
        @InjectRepository(Location)
        private readonly locationRepository: Repository<Location>,
    ) {
        super(locationRepository);
    }

    async findById(locationId: number): Promise<Location | null> {
        return this.locationRepository.findOne({ where: { locationId } });
    }

    async findAll(): Promise<Location[]> {
        return this.locationRepository.find();
    }

    async findAllAndMap(): Promise<Map<string, number>> {
        const locations = await this.findAll();
        return new Map(locations.map((location) => [location.countryName, location.locationId]));
    }

    async insertNewLocations(items: ILocation[]): Promise<void> {
        if (!items.length) {
            return;
        }

        const valuesToInsert = items.map((item) => ({ countryName: normalizeStringValue(item.countryName) }));

        await this.insertManyIgnoreConflicts(valuesToInsert);
    }
}
