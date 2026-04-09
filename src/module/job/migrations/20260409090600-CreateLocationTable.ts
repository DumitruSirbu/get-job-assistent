import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateLocationTable20260409090600 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'location',
                columns: [
                    {
                        name: 'location_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'country_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'location',
            new TableIndex({
                name: 'IDX_location_country_name_unique',
                columnNames: ['country_name'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('location', 'IDX_location_country_name_unique');
        await queryRunner.dropTable('location');
    }
}
