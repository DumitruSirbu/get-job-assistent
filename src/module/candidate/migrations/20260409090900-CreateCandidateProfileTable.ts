import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCandidateProfileTable20260409090900 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'candidate_profile',
                columns: [
                    {
                        name: 'candidate_profile_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'full_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'open_to_remote',
                        type: 'boolean',
                        isNullable: false,
                        default: true,
                    },
                    {
                        name: 'version',
                        type: 'varchar',
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
                    {
                        name: 'headline',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'location_id',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'phone',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'linkedin_url',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'cv_raw_text',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'skills_json',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'years_experience',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'experience_level_id',
                        type: 'integer',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKeys('candidate_profile', [
            new TableForeignKey({
                name: 'FK_candidate_profile_location_id',
                columnNames: ['location_id'],
                referencedTableName: 'location',
                referencedColumnNames: ['location_id'],
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            }),
            new TableForeignKey({
                name: 'FK_candidate_profile_experience_level_id',
                columnNames: ['experience_level_id'],
                referencedTableName: 'experience_level',
                referencedColumnNames: ['experience_level_id'],
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
        ]);

        await queryRunner.createIndices('candidate_profile', [
            new TableIndex({
                name: 'IDX_candidate_profile_location_id',
                columnNames: ['location_id'],
            }),
            new TableIndex({
                name: 'IDX_candidate_profile_experience_level_id',
                columnNames: ['experience_level_id'],
            }),
            new TableIndex({
                name: 'IDX_candidate_profile_created_at',
                columnNames: ['created_at'],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('candidate_profile', 'IDX_candidate_profile_created_at');
        await queryRunner.dropIndex('candidate_profile', 'IDX_candidate_profile_experience_level_id');
        await queryRunner.dropIndex('candidate_profile', 'IDX_candidate_profile_location_id');
        await queryRunner.dropForeignKey('candidate_profile', 'FK_candidate_profile_experience_level_id');
        await queryRunner.dropForeignKey('candidate_profile', 'FK_candidate_profile_location_id');
        await queryRunner.dropTable('candidate_profile');
    }
}
