import { Injectable } from '@nestjs/common';
import { ollamaConfig } from 'src/config/ollamaConfig';
import type { IOllamaCvResponse } from '../interface';
import { OllamaBaseService } from './OllamaBaseService';

@Injectable()
export class OllamaCvService extends OllamaBaseService {
    constructor() {
        super(ollamaConfig.host, ollamaConfig.model);
    }

    async extractCvProfile(cvText: string): Promise<IOllamaCvResponse> {
        return this.askForJson<IOllamaCvResponse>(this.buildPrompt(cvText));
    }

    private buildPrompt(cvText: string): string {
        return `You are a CV parser. Extract structured data from the CV text below and return ONLY a valid JSON object - no markdown, no code blocks, no explanation.

        The CV is in English.
        For experinceLevel 
        - "Internship" for 0-1 years of experience
        - "Entry level" for 1-3 years of experience
        - "Associate" for 3-5 years of experience
        - "Mid-Senior level" for 5-10 years of experience
        - "Director" for 10-15 years of experience
        - "Executive" for 15+ years of experience

        For skills, use the following mapping:
        - "beginner" for skills that was mentioned in experiences less than 1 year
        - "intermediate" for skills that was mentioned in experiences between 1 and 3 years
        - "advanced" for skills that was mentioned in experiences between 3 and 5 years

        For location, use the following mapping:
        - "Moldova" for locations that are in Moldova
        - "Romania" for locations that are in Romania
        - "Bulgaria" for locations that are in Bulgaria
        - "Ukraine" for locations that are in Ukraine
        - "Other" for locations that are not in Moldova, Romania, Bulgaria, Ukraine
        
        For email, use the following mapping:
        - "email" for email that is mentioned in the CV
        - "no email" for email that is not mentioned in the CV

        For phone, use the following mapping:
        - "phone" for phone that is mentioned in the CV
        - "no phone" for phone that is not mentioned in the CV

        For linkedinUrl, use the following mapping:
        - "linkedinUrl" for linkedinUrl that is mentioned in the CV
        - "no linkedinUrl" for linkedinUrl that is not mentioned in the CV

        For githubUrl, use the following mapping:
        - "githubUrl" for githubUrl that is mentioned in the CV
        - "no githubUrl" for githubUrl that is not mentioned in the CV

        For yearsExperience, use the following mapping:
        - "yearsExperience" for yearsExperience that is mentioned in the CV
        - "0" for yearsExperience that is not mentioned in the CV


The JSON must have exactly these fields:
- "fullName": string
- "headline": string (job title or role from the top of the CV)
- "openToRemote": boolean
- "email": string
- "phone": string
- "linkedinUrl": string
- "yearsExperience": number (integer - total years of professional experience)
- "experienceLevel": string (one of: "Internship", "Entry level", "Associate", "Mid-Senior level", "Director", "Executive")
- "location": string (country name only, e.g. "Moldova")
- "skills": array of { "name": string, "level": "beginner"|"intermediate"|"advanced", "confidence": number between 0.0 and 1.0 }

CV:
${cvText}

Return ONLY the JSON object:`;
    }
}
