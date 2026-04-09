import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'apply_type', synchronize: false })
export class ApplyType {
    @PrimaryGeneratedColumn({ name: 'apply_type_id' })
    applyTypeId: number;

    @Column({ name: 'apply_type_name', type: 'varchar' })
    applyTypeName: string;
}
