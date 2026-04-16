import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCandidateCreatedAtIndexToJobMatchScore20260416120000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_job_match_score_candidate_created_at" ON "job_match_score" ("candidate_profile_id", "created_at" DESC)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_job_match_score_candidate_created_at"`);
    }
}
