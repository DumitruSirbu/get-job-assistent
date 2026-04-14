export interface IJobMatchScore {
    jobDescriptionId: number;
    candidateProfileId: number;
    scorerModelId: number;
    version: string;
    score: number;
    reasonsJson?: object | null;
    metadataJson?: object | null;
}
