import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLanguagesJsonToCandidateProfile20260416120000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'candidate_profile',
            new TableColumn({
                name: 'languages_json',
                type: 'jsonb',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('candidate_profile', 'languages_json');
    }
}
