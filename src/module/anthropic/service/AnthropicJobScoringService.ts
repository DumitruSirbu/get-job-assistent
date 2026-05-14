import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger } from '@nestjs/common';
import { anthropicConfig } from 'src/config/anthropicConfig';
import { parseJsonFromText } from 'src/common/utils/parseJsonFromText';
import { buildScoringPrompt } from 'src/module/job-scoring/prompt/buildScoringPrompt';
import { validateJobScoreResponse } from 'src/module/job-scoring/util/validateJobScoreResponse';
import type { IJobScoreResponse, IJobScorerService, IScoreJobInput } from 'src/module/job-scoring/interface';

const MAX_OUTPUT_TOKENS = 2048;

@Injectable()
export class AnthropicJobScoringService implements IJobScorerService {
    private readonly logger = new Logger(AnthropicJobScoringService.name);
    private client: Anthropic | null = null;

    get modelName(): string {
        return anthropicConfig.model;
    }

    async scoreJob(input: IScoreJobInput): Promise<IJobScoreResponse> {
        const client = this.getClient();
        const { system, user } = buildScoringPrompt(input);

        this.logger.log(`Calling Anthropic model "${anthropicConfig.model}"`);

        const response = await client.messages.create({
            model: anthropicConfig.model,
            max_tokens: MAX_OUTPUT_TOKENS,
            system: [
                {
                    type: 'text',
                    text: system,
                    cache_control: { type: 'ephemeral' },
                },
            ],
            messages: [{ role: 'user', content: user }],
        });

        const textBlock = response.content.find((block) => block.type === 'text');
        if (!textBlock || textBlock.type !== 'text') {
            throw new Error('Anthropic response contained no text block');
        }

        try {
            const parsed = parseJsonFromText<IJobScoreResponse>(textBlock.text);
            validateJobScoreResponse(parsed, 'Anthropic');
            return parsed;
        } catch (error) {
            this.logger.error(`Failed to parse Anthropic response as JSON. Preview: ${textBlock.text.slice(0, 200)}`);
            throw error;
        }
    }

    private getClient(): Anthropic {
        if (!anthropicConfig.apiKey) {
            throw new Error('ANTHROPIC_API_KEY is not set — cannot run Anthropic scoring');
        }
        if (!this.client) {
            this.client = new Anthropic({ apiKey: anthropicConfig.apiKey });
        }
        return this.client;
    }
}
