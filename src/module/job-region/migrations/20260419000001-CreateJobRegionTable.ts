import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateJobRegionTable20260419000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'job_region',
                columns: [
                    {
                        name: 'job_region_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'job_region',
            new TableIndex({
                name: 'IDX_job_region_name_unique',
                columnNames: ['name'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('job_region', 'IDX_job_region_name_unique');
        await queryRunner.dropTable('job_region');
    }
}
