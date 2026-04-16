import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'application_status', synchronize: false })
export class ApplicationStatus {
    @PrimaryGeneratedColumn({ name: 'application_status_id' })
    applicationStatusId: number;

    @Column({ name: 'status_name', type: 'varchar', unique: true })
    statusName: string;
}
