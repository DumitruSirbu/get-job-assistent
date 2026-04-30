import { Type } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
    Matches,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { IScoreNewestJobsParams } from '../../../../lib/sdk/job-scoring/interface';

@ValidatorConstraint({ name: 'publishedFromBeforePublishedTo', async: false })
class PublishedFromBeforePublishedToConstraint implements ValidatorConstraintInterface {
    validate(_: unknown, args: ValidationArguments): boolean {
        const { publishedFrom, publishedTo } = args.object as ScoreNewestJobsRequestDto;
        if (!publishedFrom || !publishedTo) {
            return true;
        }

        return publishedFrom <= publishedTo;
    }

    defaultMessage(): string {
        return 'publishedFrom must not be after publishedTo';
    }
}

export class ScoreNewestJobsRequestDto implements IScoreNewestJobsParams {
    @IsOptional()
    @IsString()
    titleKeyword?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    limit?: number;

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'publishedFrom must be YYYY-MM-DD' })
    publishedFrom?: string;

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'publishedTo must be YYYY-MM-DD' })
    @Validate(PublishedFromBeforePublishedToConstraint)
    publishedTo?: string;
}
