import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'speciality', synchronize: false })
export class Speciality {
    @PrimaryGeneratedColumn({ name: 'speciality_id' })
    specialityId: number;

    @Column({ name: 'speciality_name', type: 'varchar' })
    specialityName: string;
}
