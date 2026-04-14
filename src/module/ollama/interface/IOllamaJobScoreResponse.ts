import { IOllamaJobScoreReasons } from './IOllamaJobScoreReasons';

export interface IOllamaJobScoreResponse {
    score: number;
    reasons: IOllamaJobScoreReasons;
}
