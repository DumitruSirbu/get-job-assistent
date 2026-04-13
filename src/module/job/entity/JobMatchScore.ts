import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { JobDescription } from './JobDescription';
import { CandidateProfile } from './CandidateProfile';
import { ScorerModel } from './ScorerModel';

@Entity({ name: 'job_match_score', synchronize: false })
export class JobMatchScore {
    @PrimaryGeneratedColumn({ name: 'job_match_score_id' })
    jobMatchScoreId: number;

    @Column({ name: 'job_description_id', type: 'integer' })
    jobDescriptionId: number;

    @ManyToOne(() => JobDescription)
    @JoinColumn({ name: 'job_description_id', referencedColumnName: 'jobDescriptionId' })
    jobDescription: JobDescription;

    @Column({ name: 'candidate_profile_id', type: 'integer' })
    candidateProfileId: number;

    @ManyToOne(() => CandidateProfile)
    @JoinColumn({ name: 'candidate_profile_id', referencedColumnName: 'candidateProfileId' })
    candidateProfile: CandidateProfile;

    @Column({ name: 'scorer_model_id', type: 'integer' })
    scorerModelId: number;

    @ManyToOne(() => ScorerModel)
    @JoinColumn({ name: 'scorer_model_id', referencedColumnName: 'scorerModelId' })
    scorerModel: ScorerModel;

    @Column({ name: 'version', type: 'varchar' })
    version: string;

    @Column({ name: 'score', type: 'integer' })
    score: number;

    /**
     * Human-readable scoring breakdown per dimension.
     * Example: { matchedSkills: ["nestjs", "typescript"], missingSkills: ["python"], seniorityMatch: true, locationMatch: true }
     */
    @Column({ name: 'reasons_json', type: 'jsonb', nullable: true })
    reasonsJson?: object | null;

    /**
     * Raw output from the scorer for audit and debugging purposes.
     * For algorithm scorer: intermediate weight calculations per dimension.
     * For LLM scorer: full raw response payload returned by the model.
     */
    @Column({ name: 'metadata_json', type: 'jsonb', nullable: true })
    metadataJson?: object | null;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = new Date();
    }

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = new Date();
    }
}
