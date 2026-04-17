import { SkillLevelEnum } from 'lib/sdk';

export interface ICandidateProfileSkill {
    name: string;
    level: SkillLevelEnum;
    confidence: number;
}
