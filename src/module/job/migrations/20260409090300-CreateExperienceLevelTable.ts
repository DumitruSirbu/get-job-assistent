import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateExperienceLevelTable20260409090300 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'experience_level',
                columns: [
                    {
                        name: 'experience_level_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'experience_level_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'experience_level',
            new TableIndex({
                name: 'IDX_experience_level_name_unique',
                columnNames: ['experience_level_name'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('experience_level', 'IDX_experience_level_name_unique');
        await queryRunner.dropTable('experience_level');
    }
}
