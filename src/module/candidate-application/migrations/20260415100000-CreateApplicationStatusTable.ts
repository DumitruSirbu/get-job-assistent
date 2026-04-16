import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateApplicationStatusTable20260415100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'application_status',
                columns: [
                    {
                        name: 'application_status_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'status_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'application_status',
            new TableIndex({
                name: 'IDX_application_status_status_name_unique',
                columnNames: ['status_name'],
                isUnique: true,
            }),
        );

        await queryRunner.query(`
            INSERT INTO application_status (status_name) VALUES
                ('applied'),
                ('withdrawn'),
                ('interview'),
                ('offer'),
                ('rejected')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('application_status', 'IDX_application_status_status_name_unique');
        await queryRunner.dropTable('application_status');
    }
}
