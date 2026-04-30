import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHiddenToJobMatchScore20260429100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_match_score" ADD COLUMN IF NOT EXISTS "hidden" boolean NOT NULL DEFAULT false`);

        // Partial index — only the small set of hidden rows is indexed, since the
        // default `hidden = false` query already benefits from candidate_profile_id
        // indexes and would not gain selectivity from a composite.
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_job_match_score_candidate_hidden_true" ON "job_match_score" ("candidate_profile_id") WHERE "hidden" = true`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_job_match_score_candidate_hidden_true"`);
        await queryRunner.query(`ALTER TABLE "job_match_score" DROP COLUMN IF EXISTS "hidden"`);
    }
}
