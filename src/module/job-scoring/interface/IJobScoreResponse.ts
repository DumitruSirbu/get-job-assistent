import { IJobScoreReasons } from './IJobScoreReasons';

export interface IJobScoreResponse {
    score: number;
    reasons: IJobScoreReasons;
}
