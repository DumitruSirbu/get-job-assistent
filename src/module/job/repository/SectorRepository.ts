import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { Sector } from '../entity/Sector';
import { ISector } from '../interface';
import { normalizeStringValue } from 'src/common/utils/normalizeStringValue';

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

    async insertNewSectors(items: ISector[]): Promise<void> {
        if (!items.length) {
            return;
        }

        const valuesToInsert = items.map((item) => ({ sectorName: normalizeStringValue(item.sectorName) }));

        await this.insertManyIgnoreConflicts(valuesToInsert);
    }
}
