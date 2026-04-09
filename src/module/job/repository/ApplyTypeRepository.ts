import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ApplyType } from '../entity/ApplyType';
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';

@Injectable()
export class ApplyTypeRepository extends BaseRepository<ApplyType> {
    constructor(
        @InjectRepository(ApplyType)
        private readonly applyTypeRepository: Repository<ApplyType>,
    ) {
        super(applyTypeRepository);
    }

    async findById(applyTypeId: number): Promise<ApplyType | null> {
        return this.applyTypeRepository.findOne({ where: { applyTypeId } });
    }

    async findAllAndMap(): Promise<Map<string, number>> {
        const applyTypes = await this.findAll();
        return new Map(applyTypes.map((applyType) => [applyType.applyTypeName, applyType.applyTypeId]));
    }
}
