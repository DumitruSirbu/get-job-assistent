import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateApplyTypeTable20260409090100 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'apply_type',
                columns: [
                    {
                        name: 'apply_type_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'apply_type_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'apply_type',
            new TableIndex({
                name: 'IDX_apply_type_apply_type_name_unique',
                columnNames: ['apply_type_name'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('apply_type', 'IDX_apply_type_apply_type_name_unique');
        await queryRunner.dropTable('apply_type');
    }
}
