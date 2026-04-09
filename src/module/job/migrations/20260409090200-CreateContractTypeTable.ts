import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateContractTypeTable20260409090200 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'contract_type',
                columns: [
                    {
                        name: 'contract_type_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'contract_type_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'contract_type',
            new TableIndex({
                name: 'IDX_contract_type_contract_type_name_unique',
                columnNames: ['contract_type_name'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('contract_type', 'IDX_contract_type_contract_type_name_unique');
        await queryRunner.dropTable('contract_type');
    }
}
