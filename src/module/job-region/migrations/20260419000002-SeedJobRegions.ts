import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedJobRegions20260419000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO job_region (name) VALUES
                ('Moldova'),
                ('Denmark'),
                ('Netherlands'),
                ('Switzerland'),
                ('Austria'),
                ('Belgium'),
                ('Ukraine'),
                ('Luxembourg'),
                ('Europe'),
                ('Romania'),
                ('United Kingdom'),
                ('Germany'),
                ('France')
            ON CONFLICT DO NOTHING  
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM job_region WHERE name IN (
                'Luxembourg', 'Europe', 'Romania', 'United Kingdom',
                'Germany', 'France', 'Netherlands'
            )
        `);
    }
}
