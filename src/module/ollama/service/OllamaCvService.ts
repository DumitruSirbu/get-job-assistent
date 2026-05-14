import { Injectable } from '@nestjs/common';
import { ollamaConfig } from 'src/config/ollamaConfig';
import type { IOllamaCvResponse } from '../interface';
import { validateCvResponse } from '../util/validateCvResponse';
import { OllamaBaseService } from './OllamaBaseService';

const CV_EXTRACTION_SYSTEM_PROMPT = `You are a CV parser. Extract structured data from the CV text and return ONLY a valid JSON object - no markdown, no code blocks, no explanation.

The CV may be in any language (English, Romanian, Russian, French, etc.). Detect the language from the content and extract values in English where the schema requires fixed English labels (e.g. experienceLevel, skill level, language level, location).

For experienceLevel:
- "Internship" for 0-1 years of experience
- "Entry level" for 1-3 years of experience
- "Associate" for 3-5 years of experience
- "Mid-Senior level" for 5-10 years of experience
- "Director" for 10-15 years of experience
- "Executive" for 15+ years of experience

For skills, use the following mapping:
- "beginner" for skills mentioned in experiences less than 1 year
- "intermediate" for skills mentioned in experiences between 1 and 3 years
- "advanced" for skills mentioned in experiences between 3 and 5 years

For languages, extract all spoken/written human languages mentioned in the CV (e.g. English, French, Romanian, Russian):
- "native" for the candidate's mother tongue or language marked as native
- "fluent" for languages marked as fluent, proficient, or C1/C2 level
- "conversational" for languages marked as conversational, intermediate, B1/B2 level
- "basic" for languages marked as basic, elementary, A1/A2 level, or beginner
If no language proficiency label is given, infer "fluent" for languages clearly used in a professional context and "conversational" otherwise.
Always include the language the CV is written in, at "fluent" level or higher unless the CV explicitly states otherwise.

For location, map to one of:
- "Moldova" for locations in Moldova
- "Romania" for locations in Romania
- "Bulgaria" for locations in Bulgaria
- "Ukraine" for locations in Ukraine
- "Other" for locations outside the above countries

For yearsExperience: integer total years of professional experience; 0 if not mentioned.

The JSON must have exactly these fields:
- "fullName": string
- "headline": string (job title or role from the top of the CV)
- "openToRemote": boolean
- "email": string (empty string if not present)
- "phone": string (empty string if not present)
- "linkedinUrl": string (empty string if not present)
- "githubUrl": string (empty string if not present)
- "yearsExperience": number
- "experienceLevel": string (one of: "Internship", "Entry level", "Associate", "Mid-Senior level", "Director", "Executive")
- "location": string (country name only, e.g. "Moldova")
- "skills": array of { "name": string, "level": "beginner"|"intermediate"|"advanced", "confidence": number between 0.0 and 1.0 }
- "languages": array of { "name": string, "level": "native"|"fluent"|"conversational"|"basic" }`;

@Injectable()
export class OllamaCvService extends OllamaBaseService {
    constructor() {
        super(ollamaConfig.host, ollamaConfig.model);
    }

    async extractCvProfile(cvText: string): Promise<IOllamaCvResponse> {
        const parsed = await this.askForJson<IOllamaCvResponse>({
            system: CV_EXTRACTION_SYSTEM_PROMPT,
            user: `CV:\n${cvText}`,
        });
        validateCvResponse(parsed);
        return parsed;
    }
}
