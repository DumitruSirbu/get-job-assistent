import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from 'src/common/decorator';
import { PaginationDto } from 'src/common/dto/PaginationDto';

export class ListCompaniesParamsDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @ToBoolean()
    @IsBoolean()
    isBlacklisted?: boolean;
}
