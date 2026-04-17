import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ApplyType } from '../entity/ApplyType';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { normalizeStringValue } from 'src/common/utils/normalizeStringValue';
import { IApplyType } from '../interface';

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

    async insertNewApplyTypes(items: IApplyType[]): Promise<void> {
        if (!items.length) {
            return;
        }

        const valuesToInsert = items.map((item) => ({ applyTypeName: normalizeStringValue(item.applyTypeName) }));

        await this.insertManyIgnoreConflicts(valuesToInsert);
    }
}
