import { IsBoolean } from 'class-validator';

export class ToggleJobScoreVisibilityDto {
    @IsBoolean()
    hidden: boolean;
}
