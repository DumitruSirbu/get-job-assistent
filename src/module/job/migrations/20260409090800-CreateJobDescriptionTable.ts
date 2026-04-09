import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateJobDescriptionTable20260409090800 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'job_description',
                columns: [
                    {
                        name: 'job_description_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'job_external_id',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'published_at',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'job_url',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'company_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'apply_type_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'contract_type_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'experience_level_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'speciality_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'sector_id',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'location_id',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'apply_url',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'salary',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'applications_count',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'posted_time',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'benefits',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'description_html',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'poster_profile_url',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'poster_full_name',
                        type: 'varchar',
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

        await queryRunner.createForeignKeys('job_description', [
            new TableForeignKey({
                name: 'FK_job_description_company_id',
                columnNames: ['company_id'],
                referencedTableName: 'company',
                referencedColumnNames: ['company_id'],
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
            new TableForeignKey({
                name: 'FK_job_description_apply_type_id',
                columnNames: ['apply_type_id'],
                referencedTableName: 'apply_type',
                referencedColumnNames: ['apply_type_id'],
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
            new TableForeignKey({
                name: 'FK_job_description_contract_type_id',
                columnNames: ['contract_type_id'],
                referencedTableName: 'contract_type',
                referencedColumnNames: ['contract_type_id'],
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
            new TableForeignKey({
                name: 'FK_job_description_experience_level_id',
                columnNames: ['experience_level_id'],
                referencedTableName: 'experience_level',
                referencedColumnNames: ['experience_level_id'],
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
            new TableForeignKey({
                name: 'FK_job_description_speciality_id',
                columnNames: ['speciality_id'],
                referencedTableName: 'speciality',
                referencedColumnNames: ['speciality_id'],
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
            new TableForeignKey({
                name: 'FK_job_description_sector_id',
                columnNames: ['sector_id'],
                referencedTableName: 'sector',
                referencedColumnNames: ['sector_id'],
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
            new TableForeignKey({
                name: 'FK_job_description_location_id',
                columnNames: ['location_id'],
                referencedTableName: 'location',
                referencedColumnNames: ['location_id'],
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            }),
        ]);

        await queryRunner.createIndices('job_description', [
            new TableIndex({
                name: 'IDX_job_description_external_id_unique',
                columnNames: ['job_external_id'],
                isUnique: true,
            }),
            new TableIndex({
                name: 'IDX_job_description_job_url',
                columnNames: ['job_url'],
            }),
            new TableIndex({
                name: 'IDX_job_description_company_id',
                columnNames: ['company_id'],
            }),
            new TableIndex({
                name: 'IDX_job_description_apply_type_id',
                columnNames: ['apply_type_id'],
            }),
            new TableIndex({
                name: 'IDX_job_description_contract_type_id',
                columnNames: ['contract_type_id'],
            }),
            new TableIndex({
                name: 'IDX_job_description_experience_level_id',
                columnNames: ['experience_level_id'],
            }),
            new TableIndex({
                name: 'IDX_job_description_speciality_id',
                columnNames: ['speciality_id'],
            }),
            new TableIndex({
                name: 'IDX_job_description_sector_id',
                columnNames: ['sector_id'],
            }),
            new TableIndex({
                name: 'IDX_job_description_location_id',
                columnNames: ['location_id'],
            }),
            new TableIndex({
                name: 'IDX_job_description_published_at',
                columnNames: ['published_at'],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('job_description', 'IDX_job_description_published_at');
        await queryRunner.dropIndex('job_description', 'IDX_job_description_location_id');
        await queryRunner.dropIndex('job_description', 'IDX_job_description_sector_id');
        await queryRunner.dropIndex('job_description', 'IDX_job_description_speciality_id');
        await queryRunner.dropIndex('job_description', 'IDX_job_description_experience_level_id');
        await queryRunner.dropIndex('job_description', 'IDX_job_description_contract_type_id');
        await queryRunner.dropIndex('job_description', 'IDX_job_description_apply_type_id');
        await queryRunner.dropIndex('job_description', 'IDX_job_description_company_id');
        await queryRunner.dropIndex('job_description', 'IDX_job_description_job_url');
        await queryRunner.dropIndex('job_description', 'IDX_job_description_external_id_unique');

        await queryRunner.dropForeignKey('job_description', 'FK_job_description_location_id');
        await queryRunner.dropForeignKey('job_description', 'FK_job_description_sector_id');
        await queryRunner.dropForeignKey('job_description', 'FK_job_description_speciality_id');
        await queryRunner.dropForeignKey('job_description', 'FK_job_description_experience_level_id');
        await queryRunner.dropForeignKey('job_description', 'FK_job_description_contract_type_id');
        await queryRunner.dropForeignKey('job_description', 'FK_job_description_apply_type_id');
        await queryRunner.dropForeignKey('job_description', 'FK_job_description_company_id');

        await queryRunner.dropTable('job_description');
    }
}
