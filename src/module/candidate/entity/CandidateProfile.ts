import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ExperienceLevel } from 'src/module/job/entity/ExperienceLevel';
import { Location } from 'src/module/job/entity/Location';

@Entity({ name: 'candidate_profile', synchronize: false })
export class CandidateProfile {
    @PrimaryGeneratedColumn({ name: 'candidate_profile_id' })
    candidateProfileId: number;

    @Column({ name: 'full_name', type: 'varchar' })
    fullName: string;

    @Column({ name: 'open_to_remote', type: 'boolean', default: true })
    openToRemote: boolean;

    @Column({ name: 'version', type: 'varchar' })
    version: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ name: 'headline', type: 'varchar', nullable: true })
    headline?: string | null;

    @Column({ name: 'location_id', type: 'integer', nullable: true })
    locationId?: number | null;

    @ManyToOne(() => Location)
    @JoinColumn({ name: 'location_id', referencedColumnName: 'locationId' })
    location?: Location | null;

    @Column({ name: 'email', type: 'varchar', nullable: true })
    email?: string | null;

    @Column({ name: 'phone', type: 'varchar', nullable: true })
    phone?: string | null;

    @Column({ name: 'linkedin_url', type: 'varchar', nullable: true })
    linkedinUrl?: string | null;

    @Column({ name: 'cv_raw_text', type: 'text', nullable: true })
    cvRawText?: string | null;

    /**
     * Extracted and normalized skills with confidence scores.
     * Example: [{ name: "nestjs", level: "advanced", confidence: 0.95 }, ...]
     */
    @Column({ name: 'skills_json', type: 'jsonb', nullable: true })
    skillsJson?: object | null;

    @Column({ name: 'years_experience', type: 'integer', nullable: true })
    yearsExperience?: number | null;

    @Column({ name: 'experience_level_id', type: 'integer', nullable: true })
    experienceLevelId?: number | null;

    @ManyToOne(() => ExperienceLevel)
    @JoinColumn({ name: 'experience_level_id', referencedColumnName: 'experienceLevelId' })
    experienceLevel?: ExperienceLevel | null;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = new Date();
    }

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = new Date();
    }
}
