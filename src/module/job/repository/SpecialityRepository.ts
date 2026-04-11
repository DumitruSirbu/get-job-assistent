import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './BaseRepository';
import { Speciality } from '../entity/Speciality';
import { ISpeciality } from '../interface';
import { normalizeStringValue } from '../utils';

@Injectable()
export class SpecialityRepository extends BaseRepository<Speciality> {
    constructor(
        @InjectRepository(Speciality)
        private readonly specialityRepository: Repository<Speciality>,
    ) {
        super(specialityRepository);
    }

    async findById(specialityId: number): Promise<Speciality | null> {
        return this.specialityRepository.findOne({ where: { specialityId } });
    }

    async findAllAndMap(): Promise<Map<string, number>> {
        const specialities = await this.findAll();
        return new Map(specialities.map((speciality) => [speciality.specialityName, speciality.specialityId]));
    }

    async insertNewSpecialities(items: ISpeciality[]): Promise<void> {
        if (!items.length) {
            return;
        }

        const valuesToInsert = items.map((item) => ({ specialityName: normalizeStringValue(item.specialityName) }));

        await this.insertManyIgnoreConflicts(valuesToInsert);
    }
}
