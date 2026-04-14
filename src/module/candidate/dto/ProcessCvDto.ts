import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ProcessCvDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^v\d+$/, { message: 'version must be in the format "v1", "v2", etc.' })
    version: string = 'v1';
}
