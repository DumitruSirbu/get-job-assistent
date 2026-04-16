import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCandidateApplicationTable20260415100100 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'candidate_application',
                columns: [
                    {
                        name: 'application_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'candidate_profile_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'job_description_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'application_status_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'applied_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
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

        await queryRunner.createForeignKeys('candidate_application', [
            new TableForeignKey({
                name: 'FK_candidate_application_candidate_profile_id',
                columnNames: ['candidate_profile_id'],
                referencedTableName: 'candidate_profile',
                referencedColumnNames: ['candidate_profile_id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
            new TableForeignKey({
                name: 'FK_candidate_application_job_description_id',
                columnNames: ['job_description_id'],
                referencedTableName: 'job_description',
                referencedColumnNames: ['job_description_id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
            new TableForeignKey({
                name: 'FK_candidate_application_application_status_id',
                columnNames: ['application_status_id'],
                referencedTableName: 'application_status',
                referencedColumnNames: ['application_status_id'],
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
        ]);

        await queryRunner.createIndices('candidate_application', [
            new TableIndex({
                name: 'IDX_candidate_application_unique',
                columnNames: ['candidate_profile_id', 'job_description_id'],
                isUnique: true,
            }),
            new TableIndex({
                name: 'IDX_candidate_application_candidate_profile_id',
                columnNames: ['candidate_profile_id'],
            }),
            new TableIndex({
                name: 'IDX_candidate_application_job_description_id',
                columnNames: ['job_description_id'],
            }),
            new TableIndex({
                name: 'IDX_candidate_application_applied_at',
                columnNames: ['applied_at'],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('candidate_application', 'IDX_candidate_application_applied_at');
        await queryRunner.dropIndex('candidate_application', 'IDX_candidate_application_job_description_id');
        await queryRunner.dropIndex('candidate_application', 'IDX_candidate_application_candidate_profile_id');
        await queryRunner.dropIndex('candidate_application', 'IDX_candidate_application_unique');

        await queryRunner.dropForeignKey('candidate_application', 'FK_candidate_application_application_status_id');
        await queryRunner.dropForeignKey('candidate_application', 'FK_candidate_application_job_description_id');
        await queryRunner.dropForeignKey('candidate_application', 'FK_candidate_application_candidate_profile_id');

        await queryRunner.dropTable('candidate_application');
    }
}
