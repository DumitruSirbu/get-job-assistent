import { Module } from '@nestjs/common';
import { OllamaCvService } from './service/OllamaCvService';
import { OllamaJobScoringService } from './service/OllamaJobScoringService';

@Module({
    providers: [OllamaCvService, OllamaJobScoringService],
    exports: [OllamaCvService, OllamaJobScoringService],
})
export class OllamaModule {}
