export interface ICandidateProfile {
    fullName: string;
    openToRemote: boolean;
    version: string;
    headline?: string;
    locationId?: number;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    cvRawText?: string;
    skillsJson?: object;
    yearsExperience?: number;
    experienceLevelId?: number;
}
