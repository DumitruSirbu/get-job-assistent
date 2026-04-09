import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSectorTable20260409090500 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'sector',
                columns: [
                    {
                        name: 'sector_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'sector_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'sector',
            new TableIndex({
                name: 'IDX_sector_name_unique',
                columnNames: ['sector_name'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('sector', 'IDX_sector_name_unique');
        await queryRunner.dropTable('sector');
    }
}
