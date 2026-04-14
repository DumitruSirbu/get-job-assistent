import { IOllamaCvSkill } from './IOllamaCvSkill';

export interface IOllamaCvResponse {
    fullName: string;
    headline: string;
    openToRemote: boolean;
    email: string;
    phone: string;
    linkedinUrl: string;
    yearsExperience: number;
    experienceLevel: string;
    location: string;
    skills: IOllamaCvSkill[];
}
