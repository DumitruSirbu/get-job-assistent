import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsBlacklistedToCompany20260416000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'company',
            new TableColumn({
                name: 'is_blacklisted',
                type: 'boolean',
                isNullable: false,
                default: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('company', 'is_blacklisted');
    }
}
