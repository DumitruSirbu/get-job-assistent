import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedApplicationStatusValues20260415120000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO application_status (status_name)
            VALUES
                ('applied'),
                ('withdrawn'),
                ('interview'),
                ('offer'),
                ('rejected')
            ON CONFLICT (status_name) DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM application_status
            WHERE status_name IN ('applied', 'withdrawn', 'interview', 'offer', 'rejected')
        `);
    }
}
