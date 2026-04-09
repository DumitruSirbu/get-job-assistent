import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'experience_level', synchronize: false })
export class ExperienceLevel {
    @PrimaryGeneratedColumn({ name: 'experience_level_id' })
    experienceLevelId: number;

    @Column({ name: 'experience_level_name', type: 'varchar' })
    experienceLevelName: string;
}
