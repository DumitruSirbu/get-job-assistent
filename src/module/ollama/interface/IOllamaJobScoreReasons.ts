export interface IOllamaJobScoreReasons {
    matchedSkills: string[];
    missingSkills: string[];
    seniorityMatch: boolean;
    locationMatch: boolean;
    summary: string;
}
