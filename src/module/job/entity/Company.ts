import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'company', synchronize: false })
export class Company {
    @PrimaryGeneratedColumn({ name: 'company_id' })
    companyId: number;

    @Column({ name: 'company_name', type: 'varchar' })
    companyName: string;

    @Column({ name: 'company_external_id', type: 'varchar' })
    companyExternalId: string;

    @Column({ name: 'company_url', type: 'varchar', nullable: true })
    companyUrl?: string | null;
}
