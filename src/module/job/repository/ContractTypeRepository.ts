import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractType } from '../entity/ContractType';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { IContractType } from '../interface';
import { normalizeStringValue } from 'src/common/utils/normalizeStringValue';

@Injectable()
export class ContractTypeRepository extends BaseRepository<ContractType> {
    constructor(
        @InjectRepository(ContractType)
        private readonly contractTypeRepository: Repository<ContractType>,
    ) {
        super(contractTypeRepository);
    }

    async findAllAndMap(): Promise<Map<string, number>> {
        const contractTypes = await this.findAll();
        return new Map(contractTypes.map((contractType) => [contractType.contractTypeName, contractType.contractTypeId]));
    }

    async insertNewContractTypes(items: IContractType[]): Promise<void> {
        if (!items.length) {
            return;
        }

        const valuesToInsert = items.map((item) => ({ contractTypeName: normalizeStringValue(item.contractTypeName) }));

        await this.insertManyIgnoreConflicts(valuesToInsert);
    }
}
