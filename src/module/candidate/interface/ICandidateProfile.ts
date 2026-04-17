import { ICandidateProfileLanguage } from './ICandidateProfileLanguage';
import { ICandidateProfileSkill } from './ICandidateProfileSkill';

export interface ICandidateProfile {
    fullName: string;
    openToRemote: boolean;
    version: string;
    headline?: string | null;
    locationId?: number | null;
    email?: string | null;
    phone?: string | null;
    linkedinUrl?: string | null;
    cvRawText?: string | null;
    skillsJson?: ICandidateProfileSkill[] | null;
    languagesJson?: ICandidateProfileLanguage[] | null;
    yearsExperience?: number | null;
    experienceLevelId?: number | null;
}
