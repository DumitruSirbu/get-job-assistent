import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './BaseRepository';
import { Location } from '../entity/Location';

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
}
