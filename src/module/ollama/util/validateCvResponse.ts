import { IOllamaCvResponse } from '../interface';

const REQUIRED_STRING_FIELDS: Array<keyof IOllamaCvResponse> = ['fullName', 'headline', 'email', 'phone', 'linkedinUrl', 'experienceLevel', 'location'];

export function validateCvResponse(value: IOllamaCvResponse): void {
    if (!value || typeof value !== 'object') {
        throw new Error('Ollama CV response is not an object');
    }
    for (const field of REQUIRED_STRING_FIELDS) {
        if (typeof value[field] !== 'string') {
            throw new Error(`Ollama CV response field "${field}" must be a string`);
        }
    }
    if (typeof value.openToRemote !== 'boolean') {
        throw new Error('Ollama CV response field "openToRemote" must be a boolean');
    }
    if (!Number.isFinite(value.yearsExperience) || value.yearsExperience < 0) {
        throw new Error(`Ollama CV response field "yearsExperience" must be a non-negative number, got ${String(value.yearsExperience)}`);
    }
    if (!Array.isArray(value.skills)) {
        throw new Error('Ollama CV response field "skills" must be an array');
    }
    if (!Array.isArray(value.languages)) {
        throw new Error('Ollama CV response field "languages" must be an array');
    }
}
