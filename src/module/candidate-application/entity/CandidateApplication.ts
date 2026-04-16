import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ApplicationStatus } from './ApplicationStatus';

@Entity({ name: 'candidate_application', synchronize: false })
export class CandidateApplication {
    @PrimaryGeneratedColumn({ name: 'application_id' })
    applicationId: number;

    @Column({ name: 'candidate_profile_id', type: 'integer' })
    candidateProfileId: number;

    @Column({ name: 'job_description_id', type: 'integer' })
    jobDescriptionId: number;

    @Column({ name: 'application_status_id', type: 'integer' })
    applicationStatusId: number;

    @ManyToOne(() => ApplicationStatus)
    @JoinColumn({ name: 'application_status_id', referencedColumnName: 'applicationStatusId' })
    applicationStatus: ApplicationStatus;

    @Column({ name: 'applied_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    appliedAt: Date;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = new Date();
    }
}
