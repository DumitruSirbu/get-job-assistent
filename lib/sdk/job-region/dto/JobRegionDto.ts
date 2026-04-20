import { Expose } from 'class-transformer';

export class JobRegionDto {
    @Expose({ name: 'jobRegionId' })
    id: number;

    @Expose()
    name: string;

    @Expose()
    isSelectedByDefault: boolean;
}
