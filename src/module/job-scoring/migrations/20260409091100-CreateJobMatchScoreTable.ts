import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateJobMatchScoreTable20260409091100 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'job_match_score',
                columns: [
                    {
                        name: 'job_match_score_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'job_description_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'candidate_profile_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'scorer_model_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'version',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'score',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'reasons_json',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'metadata_json',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKeys('job_match_score', [
            new TableForeignKey({
                name: 'FK_job_match_score_job_description_id',
                columnNames: ['job_description_id'],
                referencedTableName: 'job_description',
                referencedColumnNames: ['job_description_id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
            new TableForeignKey({
                name: 'FK_job_match_score_candidate_profile_id',
                columnNames: ['candidate_profile_id'],
                referencedTableName: 'candidate_profile',
                referencedColumnNames: ['candidate_profile_id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
            new TableForeignKey({
                name: 'FK_job_match_score_scorer_model_id',
                columnNames: ['scorer_model_id'],
                referencedTableName: 'scorer_model',
                referencedColumnNames: ['scorer_model_id'],
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
        ]);

        await queryRunner.createIndices('job_match_score', [
            new TableIndex({
                name: 'IDX_job_match_score_unique',
                columnNames: ['job_description_id', 'candidate_profile_id', 'scorer_model_id', 'version'],
                isUnique: true,
            }),
            new TableIndex({
                name: 'IDX_job_match_score_job_description_id',
                columnNames: ['job_description_id'],
            }),
            new TableIndex({
                name: 'IDX_job_match_score_candidate_profile_id',
                columnNames: ['candidate_profile_id'],
            }),
            new TableIndex({
                name: 'IDX_job_match_score_scorer_model_id',
                columnNames: ['scorer_model_id'],
            }),
            new TableIndex({
                name: 'IDX_job_match_score_score',
                columnNames: ['score'],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('job_match_score', 'IDX_job_match_score_score');
        await queryRunner.dropIndex('job_match_score', 'IDX_job_match_score_scorer_model_id');
        await queryRunner.dropIndex('job_match_score', 'IDX_job_match_score_candidate_profile_id');
        await queryRunner.dropIndex('job_match_score', 'IDX_job_match_score_job_description_id');
        await queryRunner.dropIndex('job_match_score', 'IDX_job_match_score_unique');

        await queryRunner.dropForeignKey('job_match_score', 'FK_job_match_score_scorer_model_id');
        await queryRunner.dropForeignKey('job_match_score', 'FK_job_match_score_candidate_profile_id');
        await queryRunner.dropForeignKey('job_match_score', 'FK_job_match_score_job_description_id');

        await queryRunner.dropTable('job_match_score');
    }
}
