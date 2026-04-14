import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateScorerModelTable20260409091000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'scorer_model',
                columns: [
                    {
                        name: 'scorer_model_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'scorer_type',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'scorer_provider',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'scorer_model',
                        type: 'varchar',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'scorer_model',
            new TableIndex({
                name: 'IDX_scorer_model_provider_model_unique',
                columnNames: ['scorer_provider', 'scorer_model'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('scorer_model', 'IDX_scorer_model_provider_model_unique');
        await queryRunner.dropTable('scorer_model');
    }
}
