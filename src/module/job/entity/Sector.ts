import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sector', synchronize: false })
export class Sector {
    @PrimaryGeneratedColumn({ name: 'sector_id' })
    sectorId: number;

    @Column({ name: 'sector_name', type: 'varchar' })
    sectorName: string;
}
