import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from 'src/common/decorator';
import { PaginationDto } from '../../../../lib/sdk/job/dto';

export class ListCompaniesParamsDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @ToBoolean()
    @IsBoolean()
    isBlacklisted?: boolean;
}
