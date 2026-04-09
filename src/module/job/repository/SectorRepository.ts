import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './BaseRepository';
import { Sector } from '../entity/Sector';

@Injectable()
export class SectorRepository extends BaseRepository<Sector> {
    constructor(
        @InjectRepository(Sector)
        private readonly sectorRepository: Repository<Sector>,
    ) {
        super(sectorRepository);
    }

    async findById(sectorId: number): Promise<Sector | null> {
        return this.sectorRepository.findOne({ where: { sectorId } });
    }

    async findAllAndMap(): Promise<Map<string, number>> {
        const sectors = await this.findAll();
        return new Map(sectors.map((sector) => [sector.sectorName, sector.sectorId]));
    }
}
