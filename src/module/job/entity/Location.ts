import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'location', synchronize: false })
export class Location {
    @PrimaryGeneratedColumn({ name: 'location_id' })
    locationId: number;

    @Column({ name: 'country_name', type: 'varchar' })
    countryName: string;
}
