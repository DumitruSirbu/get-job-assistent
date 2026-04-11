import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCompanyTable20260409090700 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'company',
                columns: [
                    {
                        name: 'company_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'company_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'company_url',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'company_external_id',
                        type: 'integer',
                        isNullable: false,
                        isUnique: true,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'company',
            new TableIndex({
                name: 'IDX_company_external_id_unique',
                columnNames: ['company_external_id'],
                isUnique: true,
            }),
        );

        await queryRunner.createIndex(
            'company',
            new TableIndex({
                name: 'IDX_company_name',
                columnNames: ['company_name'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('company', 'IDX_company_name');
        await queryRunner.dropIndex('company', 'IDX_company_external_id_unique');
        await queryRunner.dropTable('company');
    }
}
