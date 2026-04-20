import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateJobRegionDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsBoolean()
    isSelectedByDefault?: boolean;
}
