import { Injectable } from '@nestjs/common';
import { ollamaConfig } from 'src/config/ollamaConfig';
import type { IOllamaJobScoreResponse, IScoreJobInput } from '../interface';
import { OllamaBaseService } from './OllamaBaseService';

@Injectable()
export class OllamaJobScoringService extends OllamaBaseService {
    constructor() {
        super(ollamaConfig.host, ollamaConfig.model);
    }

    get modelName(): string {
        return this.model;
    }

    async scoreJob(input: IScoreJobInput): Promise<IOllamaJobScoreResponse> {
        return this.askForJson<IOllamaJobScoreResponse>(this.buildPrompt(input));
    }

    private buildPrompt(input: IScoreJobInput): string {
        return `You are a strict, algorithmic job-match evaluator. You must evaluate the candidate against the job description following a sequential logic. If a "Stop" condition is met, you must return the current score and exit immediately.

        SCORING ALGORITHM:

        1. LOCATION CHECK (Priority 1):
        - If the job mentions "Office", "Collaboration days", "On-site", or "Hybrid" in a specific city/country that is NOT ${input.candidateLocation}:
          - SET score to 10.
          - STOP and return JSON.

        2. TITLE ANALYSIS (Priority 2):
        - Analyze the primary programming languages and frameworks in the Job Title.
        - If the title contains a specific language or framework that is NOT in the candidate's skills list (e.g., Job wants C#/.NET, Candidate has TypeScript/NestJS):
          - SET score to 20.
          - STOP and return JSON.
        - If the candidate possesses the EXACT primary technologies mentioned in the title:
          - SET initial score to 100.
          - PROCEED to Step 3.

        3. TECHNICAL STACK REFINEMENT:
        - If the job is "Full Stack" and the candidate lacks either the frontend or backend profile: Deduct 10 points.
        - For every "Required" skill in the description missing from the candidate's profile: Deduct 10 points.
        - If the job is 100% Remote (no office/geographic mandates): Add 20 points (Max 100).

        4. EXPERIENCE & SENIORITY:
        - If the job title includes "Principal", "Staff", "Lead", or "Manager" and the candidate is "Senior": Deduct 50 points.
        - If the experience level matches exactly: Add 10 points (Max 100).

        The JSON must have exactly these fields:
        - "score": number between 0 and 100 (overall match percentage)
        - "reasons": object with:
        - "matchedSkills": string[] (skills from candidate that are relevant to the job)
        - "missingSkills": string[] (skills the job requires that the candidate lacks)
        - "seniorityMatch": boolean (true if candidate experience level fits the job)
        - "locationMatch": boolean (true if candidate is open to remote or matches job location)
        - "summary": string (1-2 sentence rationale for the score)

        CANDIDATE:
        - Headline: ${input.candidateHeadline}
        - Years of experience: ${input.candidateYearsExperience}
        - Experience level: ${input.candidateExperienceLevel}
        - Open to remote: ${input.candidateOpenToRemote}
        - Skills: ${JSON.stringify(input.candidateSkills)}

        JOB:
        - Title: ${input.jobTitle}
        - Description: ${input.jobDescription.slice(0, 3000)}

        Return ONLY the JSON object:`;
    }
}
