import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'job_region', synchronize: false })
export class JobRegion {
    @PrimaryGeneratedColumn({ name: 'job_region_id' })
    jobRegionId: number;

    @Column({ name: 'name', type: 'varchar', unique: true })
    name: string;

    @Column({ name: 'is_selected_by_default', type: 'boolean', default: false })
    isSelectedByDefault: boolean;
}
