import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'contract_type', synchronize: false })
export class ContractType {
    @PrimaryGeneratedColumn({ name: 'contract_type_id' })
    contractTypeId: number;

    @Column({ name: 'contract_type_name', type: 'varchar' })
    contractTypeName: string;
}
