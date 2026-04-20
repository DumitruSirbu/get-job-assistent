import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Matches,
    Max,
    Min,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { ToBoolean } from 'src/common/decorator';
import { PaginationDto } from '../../../../lib/sdk/job/dto';

@ValidatorConstraint({ name: 'scoredFromBeforeScoredTo', async: false })
class ScoredFromBeforeScoredToConstraint implements ValidatorConstraintInterface {
    validate(_value: unknown, args: ValidationArguments): boolean {
        const obj = args.object as ListScoresRequestDto;
        if (!obj.scoredFrom || !obj.scoredTo) {
            return true;
        }

        return obj.scoredFrom <= obj.scoredTo;
    }

    defaultMessage(): string {
        return 'scoredFrom must not be after scoredTo';
    }
}

export class ListScoresRequestDto extends PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    minScore?: number;

    @IsOptional()
    @ToBoolean()
    @IsBoolean()
    locationMatch?: boolean;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(['score:desc', 'score:asc', 'publishedAt:desc'])
    sort: 'score:desc' | 'score:asc' | 'publishedAt:desc' = 'score:desc';

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'scoredFrom must be YYYY-MM-DD' })
    scoredFrom?: string;

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'scoredTo must be YYYY-MM-DD' })
    @Validate(ScoredFromBeforeScoredToConstraint)
    scoredTo?: string;
}
