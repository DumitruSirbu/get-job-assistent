import { Logger } from '@nestjs/common';
import { ScorerProviderEnum } from 'src/module/job-scoring/enum';

const logger = new Logger('scoringConfig');

const rawProvider = process.env.SCORING_PROVIDER?.toLowerCase() ?? '';

const knownProviders = Object.values(ScorerProviderEnum) as string[];

function resolveProvider(): ScorerProviderEnum {
    if (!rawProvider) {
        return ScorerProviderEnum.OLLAMA;
    }
    if (knownProviders.includes(rawProvider)) {
        return rawProvider as ScorerProviderEnum;
    }
    logger.warn(`Unknown SCORING_PROVIDER="${rawProvider}", falling back to "${ScorerProviderEnum.OLLAMA}"`);
    return ScorerProviderEnum.OLLAMA;
}

export const scoringConfig = {
    provider: resolveProvider(),
};
