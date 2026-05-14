import { Injectable } from '@nestjs/common';
import { ollamaConfig } from 'src/config/ollamaConfig';
import { buildScoringPrompt } from 'src/module/job-scoring/prompt/buildScoringPrompt';
import { validateJobScoreResponse } from 'src/module/job-scoring/util/validateJobScoreResponse';
import type { IJobScoreResponse, IJobScorerService, IScoreJobInput } from 'src/module/job-scoring/interface';
import { OllamaBaseService } from './OllamaBaseService';

@Injectable()
export class OllamaJobScoringService extends OllamaBaseService implements IJobScorerService {
    constructor() {
        super(ollamaConfig.host, ollamaConfig.model);
    }

    get modelName(): string {
        return this.model;
    }

    async scoreJob(input: IScoreJobInput): Promise<IJobScoreResponse> {
        const { system, user } = buildScoringPrompt(input);
        const parsed = await this.askForJson<IJobScoreResponse>({ system, user });
        validateJobScoreResponse(parsed, 'Ollama');
        return parsed;
    }
}
