import { Module } from '@nestjs/common';
import { AnthropicJobScoringService } from './service/AnthropicJobScoringService';

@Module({
    providers: [AnthropicJobScoringService],
    exports: [AnthropicJobScoringService],
})
export class AnthropicModule {}
