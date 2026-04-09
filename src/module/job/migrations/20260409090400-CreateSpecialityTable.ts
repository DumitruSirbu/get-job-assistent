import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSpecialityTable20260409090400 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'speciality',
                columns: [
                    {
                        name: 'speciality_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'speciality_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'speciality',
            new TableIndex({
                name: 'IDX_speciality_name_unique',
                columnNames: ['speciality_name'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('speciality', 'IDX_speciality_name_unique');
        await queryRunner.dropTable('speciality');
    }
}
