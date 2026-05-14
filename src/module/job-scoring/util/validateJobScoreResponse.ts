import { IJobScoreResponse } from '../interface/IJobScoreResponse';

export function validateJobScoreResponse(value: IJobScoreResponse, providerLabel: string): void {
    const score = value?.score;
    if (!Number.isFinite(score) || score < 0 || score > 100) {
        throw new Error(`${providerLabel} response score is invalid: ${String(score)}`);
    }
    const reasons = value?.reasons;
    if (!reasons || typeof reasons !== 'object') {
        throw new Error(`${providerLabel} response is missing reasons object`);
    }
    if (!Array.isArray(reasons.matchedSkills) || !Array.isArray(reasons.missingSkills)) {
        throw new Error(`${providerLabel} response reasons.matchedSkills / missingSkills must be arrays`);
    }
    if (typeof reasons.seniorityMatch !== 'boolean' || typeof reasons.locationMatch !== 'boolean') {
        throw new Error(`${providerLabel} response reasons.seniorityMatch / locationMatch must be booleans`);
    }
    if (typeof reasons.summary !== 'string') {
        throw new Error(`${providerLabel} response reasons.summary must be a string`);
    }
}
