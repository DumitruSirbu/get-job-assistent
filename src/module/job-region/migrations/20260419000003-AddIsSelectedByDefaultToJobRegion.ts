import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsSelectedByDefaultToJobRegion20260419000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'job_region',
            new TableColumn({
                name: 'is_selected_by_default',
                type: 'boolean',
                default: false,
                isNullable: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('job_region', 'is_selected_by_default');
    }
}
