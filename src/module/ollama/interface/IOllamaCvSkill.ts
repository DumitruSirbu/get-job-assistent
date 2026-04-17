import { SkillLevelEnum } from 'lib/sdk';

export interface IOllamaCvSkill {
    name: string;
    level: SkillLevelEnum;
    confidence: number;
}
