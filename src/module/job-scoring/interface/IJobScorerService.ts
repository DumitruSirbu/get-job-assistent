import { IJobScoreResponse } from './IJobScoreResponse';
import { IScoreJobInput } from './IScoreJobInput';

export interface IJobScorerService {
    readonly modelName: string;
    scoreJob(input: IScoreJobInput): Promise<IJobScoreResponse>;
}
