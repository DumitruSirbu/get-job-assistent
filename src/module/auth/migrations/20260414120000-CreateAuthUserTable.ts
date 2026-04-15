import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAuthUserTable20260414120000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'auth_user',
                columns: [
                    {
                        name: 'auth_user_id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: 'password_hash',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        isNullable: false,
                        default: true,
                    },
                    {
                        name: 'refresh_token_hash',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndices('auth_user', [
            new TableIndex({
                name: 'IDX_auth_user_email_unique',
                columnNames: ['email'],
                isUnique: true,
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('auth_user', 'IDX_auth_user_email_unique');
        await queryRunner.dropTable('auth_user');
    }
}
