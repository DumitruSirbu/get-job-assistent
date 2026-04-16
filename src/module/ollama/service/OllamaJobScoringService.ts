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
        return `You are a strict, algorithmic job-match evaluator. Follow these steps in order. Execute each STOP instruction immediately — do not continue to further steps once a STOP is reached.

        CANDIDATE:
        - Headline: ${input.candidateHeadline}
        - Location: ${input.candidateLocation}
        - Years of experience: ${input.candidateYearsExperience}
        - Experience level: ${input.candidateExperienceLevel}
        - Open to remote: ${input.candidateOpenToRemote}
        - Skills: ${JSON.stringify(input.candidateSkills)}

        JOB:
        - Title: ${input.jobTitle}
        - Description: ${input.jobDescription.slice(0, 3000)}

        ---
        SCORING ALGORITHM:

        STEP 1 — LOCATION FEASIBILITY CHECK (Priority 1):
        Carefully read the full job description for any of the following signals:
          a) The job is on-site, hybrid, or office-based in a city/country that is NOT "${input.candidateLocation}".
          b) The job is listed as "remote" but explicitly restricts candidates to a specific country or region (e.g. "Remote (UK only)", "must be based in Germany", "EU residents only", "Remote - USA").
          c) The job requires regular on-site client travel in a country other than "${input.candidateLocation}" (e.g. "occasional travel to London", "1-2x per month client visits").
          d) The job requires country-specific security clearance, work authorization, or visa that would not apply to someone in "${input.candidateLocation}" (e.g. "UK SC clearance", "must be eligible to work in the US without sponsorship").
        - If ANY of (a), (b), (c), or (d) is detected:
          - SET score to 15.
          - SET locationMatch to false.
          - List in missingSkills: the exact restriction found (e.g. "Remote restricted to UK residents", "Requires SC clearance", "Regular travel to London required").
          - STOP and return JSON.
        - If the job is fully remote with NO country restriction AND the candidate is open to remote:
          - Note: location is a positive. Do NOT add bonus points here; handle in Step 4.

        STEP 2 — CORE TECHNOLOGY IDENTIFICATION:
        Identify the PRIMARY technology or language the role is built around. This is the one technology the whole role depends on — not just mentioned in passing.
        Rules for identifying the primary technology:
          - If the job title names a single language or framework (e.g. "Senior Rust Developer", "Python Engineer"), that is the primary technology.
          - If the description is dominated by one language throughout (e.g. every requirement mentions Rust, C++, Python), that is the primary technology even if other languages appear as alternatives.
          - If the description lists alternatives like "Python, TypeScript, or similar", treat the FIRST or most-emphasized language as the dominant one but do NOT auto-fail for the others — proceed to Step 3 for nuanced scoring.

        STEP 3 — PRIMARY TECHNOLOGY MATCH CHECK:
        - If the primary technology identified in Step 2 is completely absent from the candidate's skills list (e.g. role needs Rust, candidate has no Rust):
          - SET score to 20.
          - Add the missing primary technology to missingSkills.
          - STOP and return JSON.
        - If the primary technology is present in the candidate's skills at "advanced" or "intermediate" level:
          - SET initial score to 85.
          - PROCEED to Step 4.
        - If the primary technology is present but only at "beginner" level:
          - SET initial score to 60.
          - PROCEED to Step 4.

        STEP 4 — ROLE FOCUS & STACK DEPTH:
        Determine whether the role has a declared focus orientation (frontend-heavy, backend-heavy, systems-level, data-heavy, etc.) and compare it to the candidate's profile.

          a) FRONTEND-FOCUSED roles (primary focus is UI, React, Angular, Vue, CSS, UX):
             - If the candidate's headline and skill list is primarily backend-oriented (e.g. NestJS, Node.js, distributed systems as top skills with React only at beginner level):
               - Deduct 20 points.
               - Add "frontend-focused role — candidate is backend-oriented" to missingSkills.

          b) DOMINANT SECONDARY TECHNOLOGY PENALTY:
             - If the job description lists multiple technologies but the candidate only matches a secondary/alternative one (e.g. job wants "Python or TypeScript", candidate only has TypeScript but the description emphasizes Python):
               - Deduct 20 points.
               - Add the dominant missing technology to missingSkills (e.g. "Python — dominant job technology not in candidate stack").

          c) REQUIRED skills listed explicitly in the description (marked as "Required", "Must have", "Essential"):
             - For each hard-required skill or domain missing from the candidate: Deduct 10 points.
             - Add each missing hard requirement to missingSkills.

          d) REMOTE BONUS:
             - If the job is fully remote with no country restriction and the candidate is open to remote: Add 10 points (cap at 100).

        STEP 5 — EXPERIENCE & SENIORITY:
        - If the job title includes "Principal", "Staff", "Lead", or "Manager" and the candidate's experience level is "Senior": Deduct 30 points.
        - If the candidate's experience level exactly matches the job's required level: Add 5 points (cap at 100).

        ---
        SCORE ANCHORS (use as a sanity check before returning):
        - 85–100: Strong direct match — primary technology matches at advanced/intermediate level, role focus aligns, location is feasible.
        - 60–84:  Partial match — core stack is present but role focus, seniority, or secondary skills diverge.
        - 30–59:  Weak match — significant gaps in required skills, domain, or orientation.
        - 15–29:  Near-disqualifying — primary technology absent OR location/travel constraint detected.
        - 0–14:   Full disqualification — multiple hard blockers simultaneously.

        NEVER return 100 unless the primary technology matches at advanced level, the role focus aligns with the candidate's headline, no location constraints exist, and all listed hard requirements are met.

        ---
        Return ONLY a JSON object with exactly these fields:
        {
          "score": <integer 0–100>,
          "reasons": {
            "matchedSkills": <string[] — skills from the candidate relevant to the job>,
            "missingSkills": <string[] — required skills or constraints the candidate does not satisfy; always include the specific technology or constraint name>,
            "seniorityMatch": <boolean — true if candidate experience level fits the job>,
            "locationMatch": <boolean — true only if the job is reachable for the candidate with no country/travel/clearance blockers>,
            "summary": <string — 1–2 sentences explaining the score; must explicitly mention role focus mismatch, missing primary technology, or location/travel issues if any drove the score down>
          }
        }`;
    }
}
