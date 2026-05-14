export interface IJobScoringQueuePayload {
    jobDescriptionId: number;
    candidateProfileId: number;
    scorerModelId: number;
    runId?: string;
}
