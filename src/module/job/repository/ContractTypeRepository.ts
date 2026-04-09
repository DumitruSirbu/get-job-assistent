import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractType } from '../entity/ContractType';
import { BaseRepository } from './BaseRepository';

@Injectable()
export class ContractTypeRepository extends BaseRepository<ContractType> {
    constructor(
        @InjectRepository(ContractType)
        private readonly contractTypeRepository: Repository<ContractType>,
    ) {
        super(contractTypeRepository);
    }
}
